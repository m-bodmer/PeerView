# Create your views here.
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.db import IntegrityError, connection
from models import *
import sys

def my_login(request):
	username = request.POST['username']
	password = request.POST['password']
	user = authenticate(username=username, password=password)
	if user is not None:
		if user.is_active:
			login(request, user)
			all_courses = Course.objects.all()
			return render_to_response("PVBootstrap/student_welcome.html", {'all_courses': all_courses}, context_instance=RequestContext(request))
		else:
			return HttpResponse("Disabled Account")
	else:
		return render_to_response("PVBootstrap/index_invalid_login.html", {}, context_instance=RequestContext(request))
		
def home(request):
	if request.user.is_authenticated():
		all_courses = Course.objects.all()
		return render_to_response("PVBootstrap/student_welcome.html", {'all_courses': all_courses}, context_instance=RequestContext(request))
		#return render_to_response("PVBootstrap/student_welcome.html", {}, context_instance=RequestContext(request))
	else:
		return render_to_response("PVBootstrap/index.html", {}, context_instance=RequestContext(request))
	
def about(request):
	return render_to_response("PVBootstrap/about.html", {}, context_instance=RequestContext(request))

def new_user_info(request):
	return render_to_response("PVBootstrap/register_account.html", {}, context_instance=RequestContext(request))

def create_new_user(request):
	check_error = 0
	username = request.POST['username']
	email = request.POST['email']
	password = request.POST['password']

	if not username or not password or not email:
		check_error = 1
		return render_to_response("PVBootstrap/register_account_again.html", {'errors': check_error}, context_instance=RequestContext(request))

	try:
		user = User.objects.create_user(username, email, password)
		#Students permissions has to be in id 2 (Add Students Permission Group 2nd in Auth.Groups)
		user.groups.add(2)
		user.save()
	except IntegrityError:
		connection.close()
		check_error = 2
		return render_to_response("PVBootstrap/register_account_again.html", {'errors': check_error}, context_instance=RequestContext(request))
	
	return render_to_response("PVBootstrap/index.html", {'errors': check_error}, context_instance=RequestContext(request))


def help(request):
	return render_to_response("PVBootstrap/help.html", {}, context_instance=RequestContext(request))


def logout_user(request):
	logout(request)
	return render_to_response("PVBootstrap/index.html", {}, context_instance=RequestContext(request))
	
def get_course(request):
	#Get the available blank surveys from the database to fill out
	#TODO Make it so they can only fill out a survey once
	selected_course = Course.objects.get(name=request.POST['selected_course'])
	surveys = BlankSurvey.objects.filter(course=selected_course)

	show_flag = False
	for s in surveys:
		if s.status == 'o':
			show_flag = True

	#Get Filled out surveys already in the Database so the student can edit them
	filled_surveys = FilledSurvey.objects.filter(user=request.user)

	completed_surveys = []

	for s in filled_surveys:
		original_survey = BlankSurvey.objects.get(name=s.survey.name, status='o')
		if original_survey:
			s_name = original_survey.name
			completed_surveys.append(s)

	print completed_surveys
	return render_to_response("PVBootstrap/student_courses.html", {'course': selected_course, 'course_surveys': surveys, 'completed_surveys': completed_surveys, 'open_surveys': show_flag}, context_instance=RequestContext(request))

def add_course(request):
	course_name = request.POST['course_name']
	instructor = request.POST['instructor']
	description = request.POST['description']
	added = False
	if course_name and instructor:
		c = Course(name=course_name, instructor=instructor, description=description)
		c.save()
		added = True
	all_courses = Course.objects.all()
	return render_to_response("PVBootstrap/student_welcome.html", {'added': added, 'all_courses': all_courses}, context_instance=RequestContext(request))

def add_filled_survey(request, course, survey):
	#Flag to see if all radio buttons has been filled out
	all_buttons_checked = 0
	survey_scores = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
	num_questions = int(request.POST['num_questions'])
	answers = [int(request.POST[q]) for q in request.POST if q.startswith("choice_")]
	score = 0
	for a in answers:
		if a in survey_scores.keys():
			score += survey_scores[a]

	if 'comments' in request.POST:
		comments = request.POST['comments']

	#Create new filled_survey object
	if num_questions == len(answers):
		c = Course.objects.get(name=course)
		g = Group.objects.get(group_name=request.POST['selected_group'])
		s = BlankSurvey.objects.get(name=survey)
		fs = FilledSurvey(total_value=score, comment=comments, user=request.user, course=c, group=g, survey=s)
		fs.save()
		return render_to_response("PVBootstrap/submit_success.html", {}, context_instance=RequestContext(request))
	else:
		return render_to_response("PVBootstrap/submit_fail.html", {}, context_instance=RequestContext(request))


def get_survey(request, course):
	#Here we have to return a survey from the POST request, by looking it up in the database
	selected_survey = BlankSurvey.objects.get(name=request.POST['selected_survey'])
	#Look up questions and return a list of them to the template
	questions = selected_survey.questions.all()
	#Look up groups and return them to template to allow user to select one
	survey_groups = Group.objects.all()
	#IF selected_survey.name exists in the FilledSurvey with request.user attached to it, exclude it from the results
	sd = FilledSurvey.objects.filter(survey=selected_survey, user=request.user)

	for s in sd:
		for group in survey_groups:
			if (s.group == group):
				newg = []
				for g in survey_groups:
					if (s.group != g):
						newg.append(g)
				survey_groups = newg

	return render_to_response("PVBootstrap/course_survey.html", {'survey': selected_survey, 'questions': questions, 'groups': survey_groups, 'course': course}, context_instance=RequestContext(request))

def edit_survey(request, course):
	#Get the survey the user selected, send all information from it to template
	fs = request.POST['selected_survey']

	parts = fs.split(" | ")

	selected_survey = BlankSurvey.objects.get(name=parts[0])
	g = Group.objects.get(group_name=parts[1])

	filled_survey = FilledSurvey.objects.get(survey=selected_survey, group=g)
	questions = filled_survey.survey.questions.all()

	return render_to_response("PVBootstrap/edit_course_survey.html", {'survey': selected_survey, 'filled_survey': filled_survey, 'questions': questions, 'course':course}, context_instance=RequestContext(request))

def update_survey(request, course, survey, filled_survey):
	#Save the survey and its updated fields to the database
	#If survey was updated successfully, redirect to success
	all_buttons_checked = 0
	survey_scores = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
	num_questions = int(request.POST['num_questions'])
	answers = [int(request.POST[q]) for q in request.POST if q.startswith("choice_")]
	score = 0
	for a in answers:
		if a in survey_scores.keys():
			score += survey_scores[a]

	if 'comments' in request.POST:
		comments = request.POST['comments']

	#Update filled_survey object
	if num_questions == len(answers):
		print "here"
		c = Course.objects.get(name=course)
		s = BlankSurvey.objects.get(name=survey)
		g = Group.objects.get(group_name = filled_survey.split(" filled out for ")[1].split(" by ")[0])
		fs = FilledSurvey.objects.get(course=c, user=request.user, survey=s, group=g)
		fs.total_value = score
		fs.comment = comments
		fs.save()
		return render_to_response("PVBootstrap/submit_success.html", {}, context_instance=RequestContext(request))
	else:
		return render_to_response("PVBootstrap/submit_fail.html", {}, context_instance=RequestContext(request))

def grade_survey_forceavg(request, selected_survey, average, base):
	#Get the blank survey they want all the marks for
	#selected_survey = request.POST['selected_survey']
	#Get all filled surveys with the current survey as the base
	survey_list = FilledSurvey.objects.filter(survey=selected_survey)
	#Variables to be used
	group_list = []		#List of all groups participating
	total_grades = []	#List holding each grade that each group recieved
	#base = 40			#The lowest mark possible, may be specified by instructor (See next line)
	#average = (100 + base)/2	#The average, in this case 70 (half way between lowest, 40, and highest, 100)
	overall_total = 0	#Total of group averages

	#Build up the list of groups
	for survey in survey_list:
		
		if not survey.group in group_list:
			group_list.append(survey.group)

	#Calculate all grades here: First loop through every group and find all their grades, and average
	for group in group_list:
		group_total = 0

		#Loop through all surveys for the group, and find the average for the group
		for survey in FilledSurvey.objects.filter(survey=selected_survey, group=group):

			#Query database for all the questions in that surve
			num_questions = len(selected_survey.questions.all())

			#Find the average grade from this survey and store it
			group_total += float(survey.total_value * (100-base)/4 + base)/num_questions
		
		#Find the average grade given to the group and store it
		overall_total += group_total / len(FilledSurvey.objects.filter(survey=selected_survey, group=group))
		total_grades.append(group_total / len(FilledSurvey.objects.filter(survey=selected_survey, group=group)))

	#Find the average and multiply every group's grade by the normalizer (which forces the average to what is wanted)
	overall_average = overall_total / len(group_list)
	normalizer = float(average) / overall_average
	total_grades[:] = [x*normalizer for x in total_grades] 

	#Returns the average for each group with the group list, so grades and groups can be matched, as well as the overall average before normalizing
	#return render_to_response("PVBootstrap/course_survey.html", {'grades': total_grades,'average': overall_average,'groups': group_list}, context_instance=RequestContext(request))
	return (total_grades, group_list)

def grade_survey_useravg(request, selected_survey, average, base):
	#Get all filled surveys with the current survey as the base
	survey_list = FilledSurvey.objects.filter(survey=selected_survey)
	#Variables to be used
	user_list = []		#List of all users participating
	group_list = []
	total_grades = []	#Double list holding each grade that each group recieved
	final_grades = []	#Grades after averaging, divided by group
	final_nsurveys = []
	overall_total = 0
	#base = 40			#The lowest mark possible, may be specified by instructor (See next line)
	#base = request.POST['force_average']*2 - 100	#USE THIS if you want to implement the changable average. Changes to base on it's own, enter average.
	#average = (100 + base)/2	#The average, in this case 70 (half way between lowest, 40, and highest, 100)
	
	for survey in survey_list:
		if not survey.user in user_list:
			user_list.append(survey.user)

		if not survey.group in group_list:
			group_list.append(survey.group)

	#Calculate all grades here: First loop through every group and find all their grades, and average
	for user in user_list:
		user_grades = []
		for group in group_list:
			user_grades.append(0)

		print 'User grades EMPTY:'
		print user_grades

		user_total = 0
		user_surveys = sorted(FilledSurvey.objects.filter(survey=selected_survey, user=user), key=lambda x: x.group)
		
		for survey in user_surveys:
			#Query database for all the questions in that survey
			num_questions = len(selected_survey.questions.all())

			#Find the average grade from this survey and store it
			user_total += float(survey.total_value * (100-base)/4 + base)/num_questions

			user_grades[group_list.index(survey.group)] = (float(survey.total_value * (100-base)/4 + base)/num_questions)

		user_total = float(user_total) / len(user_surveys)
		user_grades[:] = [x*(float(average) / user_total) for x in user_grades] 

		print 'User grades FULL:'
		print user_grades

		overall_total += user_total
		total_grades.append(user_grades)
	
	#Find the average and multiply every group's grade by the normalizer (which forces the average to what is wanted)
	overall_average = float(overall_total) / len(user_list)

	for group in group_list:
		final_grades.append(0)
		final_nsurveys.append(0)
	print 'New finals:'
	print final_grades
	print total_grades

	for user in total_grades:
		for group in user:
			final_grades[user.index(group)] += group
			if group != 0:
				final_nsurveys[user.index(group)] += 1

	final_grades[:] = [float(x)/final_nsurveys[final_grades.index(x)] for x in final_grades]

	#Returns the average for each group with the group list, so grades and groups can be matched
	#return render_to_response("PVBootstrap/course_survey.html", {'grades': final_grades,'groups': group_list}, context_instance=RequestContext(request))
	return (final_grades, group_list)

def get_comments(request, selected_survey):

	survey_list = FilledSurvey.objects.filter(survey=selected_survey)
	user_list = []
	group_list = []
	comments = []

	for survey in survey_list:
		if not survey.user in user_list:
			user_list.append(survey.user)

		if not survey.group in group_list:
			group_list.append(survey.group)

	for user in user_list:
		for survey in FilledSurvey.objects.filter(survey=selected_survey, user=user):
			if survey.comment != None:
				comments.append([user.username, survey.group, survey.comment])

	return (comments)

