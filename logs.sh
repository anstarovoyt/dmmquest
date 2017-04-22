#!/bin/bash
while :
do
	heroku logs --dyno web.1 -t > ../../dmmquest.log 
	sleep 1
done
