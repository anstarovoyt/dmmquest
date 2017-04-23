#!/bin/bash
while :
do
	heroku logs --dyno web.1 -t > ../../dmmquest.log
	echo 'sleep'
	sleep 1
done
