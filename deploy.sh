git checkout -b master
git rebase develop
git checkout develop
git push heroku master -f

