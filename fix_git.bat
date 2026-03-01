@echo off
echo --- GIT STATUS --- > git_report.txt
git status >> git_report.txt 2>&1
echo. >> git_report.txt
echo --- UNMERGED FILES --- >> git_report.txt
git diff --name-only --diff-filter=U >> git_report.txt 2>&1
echo. >> git_report.txt
echo --- CURRENT BRANCH --- >> git_report.txt
git branch >> git_report.txt 2>&1
echo. >> git_report.txt
echo --- ATTEMPTING ABORT --- >> git_report.txt
git merge --abort >> git_report.txt 2>&1
git rebase --abort >> git_report.txt 2>&1
echo. >> git_report.txt
echo --- ATTEMPTING ADD & COMMIT --- >> git_report.txt
git add . >> git_report.txt 2>&1
git commit -m "auto resolve" >> git_report.txt 2>&1
echo. >> git_report.txt
echo --- FINAL STATUS --- >> git_report.txt
git status >> git_report.txt 2>&1
