git checkout master
git rebase develop
webpack --TARGET=DIST
git add .
git commit -m 'add dist'
git checkout develop
git push heroku master -f

