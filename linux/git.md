## Work with fork/upstream repos

Clone fork and add upstream repo:

    git clone path-to-fork.git
    git remote add upstream path-to-upstream.git
    git remote -v

Fetch upstream, checkout upstream/master and merge it into the fork-repo:

    git fetch upstream
	git checkout master
	git merge upstream/master
	git status

## Branching

Create additional branch:

    git checkout -b BRANCH
    git push origin BRANCH

Switch branch:

    git pull
    git checkout BRANCH

Diff branch to master:

    git diff master..BRANCH

Merge branch to master:

    git checkout master
    git merge BRANCH
    git push
    # and to delete it:
    git branch -d BRANCH
    git push origin :BRANCH

## Stashing

Save local changes to stash:

    git stash

Show stashes:

    git stash list

Restore latest stash and delete it:

    git stash pop

## Tagging

Create tag in current branch:

    git tag TAG
    git push origin TAG

List all tags:

    git tag

## Undo local changes

    git reset --hard

Same in SVN:

    svn revert -R .
    svn up

## Cherry picking

Merge a single commit into an other branch:

    git checkout SOURCEBRANCH
    git log / git reflog
    git checkout TARGETBRANCH
    git cherry-pick COMMITHASH

## Rebasing

Squash all commits after HASH [or the NUMBER of commits] into one new commit:

    git rebase -i HASH # or: git rebase -i HEAD~NUMBER
    # in the editor replace pick by squash for all lines but the first: s/^pick /squash /
    # in the second editor: write the new commit message
    git push -f
