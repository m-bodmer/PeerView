import csv
from peerview.models import *
from django.contrib import admin
from django.contrib.sites.models import Site
from django.http import HttpResponse
from peerview.views import *
from django import forms

class BlankSurveyAdmin(admin.ModelAdmin):
	list_display = ('name', 'course', 'create_date', 'status')
	ordering = ['course']
	actions = ['grade_overall_65', 'grade_overall_70', 'grade_overall_75', 'grade_overall_80', 'grade_student_65', 'grade_student_70', 'grade_student_75', 'grade_student_80', 'get_comments', 'open_surveys', 'close_surveys']

	

	#FilledSurveyAdmin to get grades for a FilledSurvey
	def get_grades(self, request, queryset, avg, base):
		response = HttpResponse(mimetype='text/csv')
		response['Content-Disposition'] = 'attachment; filename=grade_results.csv'
		writer = csv.writer(response)

		opts = self.model._meta
		field_names = [field.name for field in opts.fields]

		#Get these from the user somehow?
		#avg = 70	#Force marks to this average
		#base = 40	#Lowest possible mark, ie. Very Bad = 40%, Excellent = 100%
		
		# Write data rows
		for survey in queryset:
			writer.writerow([survey.name])
			# Write a first row with header information
			writer.writerow(['Group', 'Grade'])
			#For each FilledSurvey, compute the marks of the users associated with it
			#Create a Calculate function and all teh arguments it needs
			#Send each FilledSurvey to the python function
			total_grades, group_list = grade_survey_forceavg(request, survey, avg, base)
			#Return a list above of all the fields required for the CSV file and write to CSV file
			print total_grades
			print group_list
			for group in group_list:
				writer.writerow([group,total_grades[group_list.index(group)]])
			writer.writerow([' '])
		return response
	get_grades.short_description = "Grade Selected Surveys - Overall 70 Average"

	def grade_overall_65(self, request, queryset):
		return self.get_grades(request, queryset, 65, 40)
	grade_overall_65.short_description = "Grade Selected Surveys - Overall 65"

	def grade_overall_70(self, request, queryset):
		return self.get_grades(request, queryset, 70, 40)
	grade_overall_70.short_description = "Grade Selected Surveys - Overall 70"

	def grade_overall_75(self, request, queryset):
		return self.get_grades(request, queryset, 75, 40)
	grade_overall_75.short_description = "Grade Selected Surveys - Overall 75"

	def grade_overall_80(self, request, queryset):
		return self.get_grades(request, queryset, 80, 40)
	grade_overall_80.short_description = "Grade Selected Surveys - Overall 80"

	def grade_student_65(self, request, queryset):
		return self.get_grades_2(request, queryset, 65, 40)
	grade_student_65.short_description = "Grade Selected Surveys - Student 65"

	def grade_student_70(self, request, queryset):
		return self.get_grades_2(request, queryset, 70, 40)
	grade_student_70.short_description = "Grade Selected Surveys - Student 70"

	def grade_student_75(self, request, queryset):
		return self.get_grades_2(request, queryset, 75, 40)
	grade_student_75.short_description = "Grade Selected Surveys - Student 75"

	def grade_student_80(self, request, queryset):
		return self.get_grades_2(request, queryset, 80, 40)
	grade_student_80.short_description = "Grade Selected Surveys - Student 80"

	#FilledSurveyAdmin to get grades for a FilledSurvey
	def get_grades_2(self, request, queryset, avg, base):
		response = HttpResponse(mimetype='text/csv')
		response['Content-Disposition'] = 'attachment; filename=grade_results.csv'
		writer = csv.writer(response)

		opts = self.model._meta
		field_names = [field.name for field in opts.fields]

		#Get these from the user somehow?
		#avg = 70	#Force marks to this average
		#base = 40	#Lowest possible mark, ie. Very Bad = 40%, Excellent = 100%

		# Write data rows
		for survey in queryset:
			writer.writerow([survey.name])
			# Write a first row with header information
			writer.writerow(['Group', 'Grade'])
			#For each FilledSurvey, compute the marks of the users associated with it
			#Create a Calculate function and all teh arguments it needs
			#Send each FilledSurvey to the python function
			total_grades, group_list = grade_survey_useravg(request, survey, avg, base)
			#Return a list above of all the fields required for the CSV file and write to CSV file
			print total_grades
			print group_list
			for group in group_list:
				writer.writerow([group,total_grades[group_list.index(group)]])
			writer.writerow([' '])
		return response
	get_grades_2.short_description = "Grade Selected Surveys - Student 70 Average"

	def open_surveys(self, request, queryset):
		queryset.update(status='o')
	open_surveys.short_description = "Open Selected Surveys"

	def close_surveys(self, request, queryset):
		queryset.update(status='c')
	close_surveys.short_description = "Close Selected Surveys"

	def get_comments(self, request, queryset):
		response = HttpResponse(mimetype='text/csv')
		response['Content-Disposition'] = 'attachment; filename=survey_comments.csv'
		writer = csv.writer(response)

		opts = self.model._meta
		field_names = [field.name for field in opts.fields]

		# Write data rows
		for survey in queryset:
			s_name = 'Survey Name: ' + survey.name
			writer.writerow([s_name])
			# Write a first row with header information
			writer.writerow(['User', 'About Group', 'Comment'])
			#For each FilledSurvey, compute the marks of the users associated with it
			#Create a Calculate function and all teh arguments it needs
			#Send each FilledSurvey to the python function
			comments = get_comments(request, survey)
			#Return a list above of all the fields required for the CSV file and write to CSV file
			for comment in comments:
				writer.writerow([comment[0], comment[1], comment[2]])
			writer.writerow([' '])
		return response
	get_comments.short_description = "Get Comments for Surveys"

	def open_surveys(self, request, queryset):
		queryset.update(status='o')
	open_surveys.short_description = "Open Selected Surveys"

	def close_surveys(self, request, queryset):
		queryset.update(status='c')
	close_surveys.short_description = "Close Selected Surveys"

admin.site.register(BlankSurvey, BlankSurveyAdmin)

class FilledSurveyAdmin(admin.ModelAdmin):
	list_display = ('course', 'group', 'user', 'total_value')
	ordering = ['course']

admin.site.register(FilledSurvey, FilledSurveyAdmin)

class GroupAdmin(admin.ModelAdmin):
	list_display = ('group_name', 'all_members')

admin.site.register(Group, GroupAdmin)
admin.site.register(Question)

class CourseAdmin(admin.ModelAdmin):
	list_display = ('name', 'instructor')

admin.site.register(Course, CourseAdmin)

class UserAdmin(admin.ModelAdmin):
	list_display = ('last_name', 'first_name', 'user_courses')
	ordering = ['last_name']
	actions = ['get_grades']

admin.site.unregister(Site)