## Shortcuts

### Edit

- **crtl+a** move to start
- **ctrl+e** move to end
- **ctrl+k** delete from cursor to end
- **ctrl+u** delete from cursor to start
- **ctrl+w** delete from cursor to start of word (or next word)
- **ctrl+y** paste last deletion (above) after cursor
- **ctrl+xx** move between start and current cursor position 
- **alt+b** move backward one word
- **alt+f** move forward one word
- **alt+d** delete from cursor to end of word
- **alt+c** capitalize from cursor to end of word
- **alt+u** make uppercase from cursor to end of word
- **alt+l** make lowercase from cursor to end of word
- **alt+t** swap current word with previous

### History

- **ctrl+r** enter the history search mode
- **ctrl+g** escape from history search mode
- **alt+.** *or* **!$** use last word of previous command
- **!!** run last command
- **!*abc*** run last command that starts with *abc*
- **!*abc*:p** print last command that starts with *abc* and make it last command
- **!$:p** print last word of previous command
- **!\*** run previous command except for the last word
- **!\*:p** print previous command except for the last word

### Control

- **ctrl+l** clear the screen
- **ctrl+s** stop output to the screen
- **ctrl+q** allow output to the screen
- **ctrl+c** terminate the command
- **ctrl+z** suspend the command (see *jobs*, *fg*, *bg*)

## Scripting

### Variable Manipulation

    ${MYVAR#pattern}         # delete shortest match of pattern from the beginning
    ${MYVAR##pattern}        # delete longest match of pattern from the beginning
    ${MYVAR%pattern}         # delete shortest match of pattern from the end
    ${MYVAR%%pattern}        # delete longest match of pattern from the end
    ${MYVAR/search/replace}  # replace first match of substring
    ${MYVAR//search/replace} # replace all matches of substring
    ${MYVAR/#search/replace} # replace match at the begin of string
    ${MYVAR/%search/replace} # replace match at the end of string
	${#MYVAR}                # string length
	${MYVAR:x}               # cut string from char x to the end
	${MYVAR:x:y}             # cut string from char x, y chars long
	${MYVAR: -x} or
	${MYVAR:(-x)}}           # cut string from start to end minus x
