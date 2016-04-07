git checkout -b master
git rebase develop
webpack --TARGET=DIST
git commit -m 'add dist'
git checkout develop
git push heroku master

