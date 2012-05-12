from django.conf.urls.defaults import patterns, include, url
import settings
import peerview

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	# Examples:
	url(r'^$', 'peerview.views.home', name='home'),
	url(r'^login/$', 'peerview.views.my_login', name='login'),
	url(r'^register_account/$', 'peerview.views.new_user_info', name='new_user_info'),
	url(r'^create_new_user/$', 'peerview.views.create_new_user', name='create_new_user'),
	url(r'^about/$', 'peerview.views.about', name='about'),
	url(r'^help/$', 'peerview.views.help', name='help'),
	url(r'^logout/$', 'peerview.views.logout_user', name='logout_user'),
	url(r'^get_course/$', 'peerview.views.get_course', name='get_course'),
	url(r'^get_survey/(?P<course>.*)/$', 'peerview.views.get_survey', name='get_survey'),
	url(r'^edit_survey/(?P<course>.*)/$', 'peerview.views.edit_survey', name='edit_survey'),
	url(r'^add_filled_survey/(?P<course>.*)/(?P<survey>.*)/$', 'peerview.views.add_filled_survey', name='add_filled_survey'),
	#url(r'^update_survey/(?P<course>.*)/(?P<survey>.*)/$', 'peerview.views.update_survey', name='update_survey'),
	url(r'^update_survey/(?P<course>.*)/(?P<survey>.*)/(?P<filled_survey>.*)/$', 'peerview.views.update_survey', name='update_survey'),
	# url(r'^pvdjango/', include('pvdjango.foo.urls')),

	# Uncomment the admin/doc line below to enable admin documentation:
	# url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

	# Uncomment the next line to enable the admin:
	url(r'^admin/', include(admin.site.urls)),
)


if settings.DEBUG:
	urlpatterns += patterns('',
		url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
			'document_root': settings.MEDIA_ROOT,
		}),
   )
