#RPGX Survey Platform

This platform was created to help the RPGX site collect information about users so that the user
experience can be overhauled. Key features include dynamic enabling/disabling of both sections
and other questions based on selected responses, progress tracking, and mixing exclusive and
non-exclusive options in the same question.

The base of the application was scaffolded using [Yeoman](http://yeoman.io/)
([yo-webapp](https://github.com/yeoman/generator-webapp)), using [Grunt](http://gruntjs.com/)
to automate testing and deployment as well as run the development server for local production.

-----

The survey depends on input in the JSON format. Currently questions.json is loaded from the local
server, but input can be loaded remotely in the future given that the target JSON meets the
project's [specifications](JSONSpecs.txt).
