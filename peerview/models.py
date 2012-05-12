from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

# Create your models here.
#Will be like what the database is

#Course Model (Name, Instructor)
class Course(models.Model):
	name = models.TextField(unique=True)
	instructor = models.CharField(max_length=200)
	description = models.TextField()
	create_date = models.DateTimeField(auto_now_add=True)

	def __unicode__(self):
		return "%s (%s)" % (self.name, self.instructor)

class Group(models.Model):
	group_name = models.TextField()
	group_members = models.ManyToManyField(User)

	def __unicode__(self):
		return "%s" % (self.group_name)

	def all_members(self):
		return ', '.join([m.username for m in self.group_members.all()])
	all_members.short_description = "Group Members"

class UserProfile(models.Model):
	user = models.OneToOneField(User)

def create_user_profile(sender, instance, created, **kwargs):
	if created:
		UserProfile.objects.create(user=instance)
post_save.connect(create_user_profile, sender=User)

#
class Question(models.Model):
	question = models.TextField()

	def __unicode__(self):
		return self.question

#
# class Answer(models.Model):
# 	# SCALE_CHOICES = (
# 	# 	(u'0', u'Very Bad'),
# 	# 	(u'1', u'Bad'),
# 	# 	(u'2', u'Average'),
# 	# 	(u'3', u'Good'),
# 	# 	(u'4', u'Very Good'),
# 	# )
# 	# scale = models.CharField(max_length=2, blank=True, choices=SCALE_CHOICES)
# 	# question = models.ForeignKey(Question)
# 	value = models.IntegerField()

# 	def __unicode__(self):
# 		return self.scale

#Survey Model (Name, Date, Course ID)
class BlankSurvey(models.Model):

	STATUS_CHOICES = (
		('o', 'Open'),
		('c', 'Closed'),
	)

	name = models.TextField(unique=True)
	course = models.ForeignKey(Course)
	status = models.CharField(max_length=1, choices=STATUS_CHOICES)
	description = models.TextField()
	questions = models.ManyToManyField(Question)
	create_date = models.DateTimeField(auto_now_add=True)

	def __unicode__(self):
		return "%s (%s) on %s" % (self.name, self.course, self.create_date.ctime())

#Survey Model (Name, Date, Course ID)
class FilledSurvey(models.Model):
	course = models.ForeignKey(Course) #Should be ManyToMany
	group = models.ForeignKey(Group)
	survey = models.ForeignKey(BlankSurvey)
	user = models.ForeignKey(User)
	#answers = models.ManyToManyField(Answer)
	create_date = models.DateTimeField(auto_now_add=True)
	comment = models.TextField()
	total_value = models.IntegerField(blank=True)

	def __unicode__(self):
		return "Survey %s filled out for %s by %s on %s" % (self.survey.name, self.group, self.user, self.create_date.ctime())