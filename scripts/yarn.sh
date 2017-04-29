#!/bin/bash

# From https://gist.github.com/maxrimue/16e272c4e0b8a8ac9dd5570e180e08c0
# until greenkeeper supports yarn: https://github.com/greenkeeperio/greenkeeper/issues/314

echo "Should yarn.lock be regenerated?"
if [[ $TRAVIS_PULL_REQUEST_BRANCH != *"greenkeeper"* ]]; then
	# Not a GreenKeeper Pull Request, aborting
	exit 0
fi

echo "Cloning repo"
git clone "https://"$PUSH_TOKEN"@github.com/"$TRAVIS_REPO_SLUG".git" repo
cd repo

echo "Switching to branch $TRAVIS_PULL_REQUEST_BRANCH"
git checkout $TRAVIS_PULL_REQUEST_BRANCH

# See if commit message includes "update"
git log --name-status HEAD^..HEAD | grep "update" || exit 0

echo "(Creat/updat)ing lockfile"
yarn

echo "Commit and push yarn.lock"
git config --global user.email "$PUSH_EMAIL"
git config --global user.name "Travis CI"
git config --global push.default simple

git add yarn.lock
git commit -m "chore: update yarn.lock"
git push
