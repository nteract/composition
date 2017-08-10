#!/bin/bash
if [[ $TRAVIS_PULL_REQUEST == false && $TRAVIS_BRANCH == "master" ]]
then
    npm run build:docs

    ( cd docs
    git init
    git config user.email "travis@travis-ci.com"
    git config user.name "Travis Bot"

    git add .
    git commit -m "Publish docs from $TRAVIS_BUILD_NUMBER"
    git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
    echo "Documentation has been published!"
    )
else
    echo "Documentation has not been published because not on master!"
fi
