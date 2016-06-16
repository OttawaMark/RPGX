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


##Getting Started

After you've pulled/cloned the project to your local environment, you need to get the updated set
of dependencies.

```
>sudo npm install
>bower install
```

If you want to update your dependencies, you can delete the `bower_components`/`node_modules`
folders and then run the above commands again. If dependencies have changed, you can remove unused
dependencies by running the above commands followed by:

```
>sudo npm prune
>bower prune
```

Node packages are intended for use at the infrastructure or development level (e.g. grunt). To
install a new node package, use:

```
>sudo npm install {package_name}(@{build}) --save-dev
```

`--save-dev` saves the dependency to package.json so it can be included the next time dependencies
are fetched.

Bower packages are used in the application itself (e.g. bootstrap, modernizr). If searching for a
package to add functionality to the project, search for a bower package first, as it is much
cleaner and much more scalable to use bower dependencies than to include source libraries in the
scripts folder. To install a new bower package, use:

```
>bower install {package_name}(#{build}) --save
```

`--save` saves the dependency to bower.json so it can be included the next time dependencies are
fetched.

##Development

Development can be done using the grunt server, which includes livereload:

```
>grunt serve
```

Any changes made to watched directories will automatically propagate into the app, so testing can
be done in real time.

##Deployment

To create a deployment build, use:

```
>grunt build
```

This compiles, concatenates, and minifies all SASS and script files associated with the project
(note that packaged dependencies and local scripts are packaged separately), placing them in
appropriate analog directories within `/dist`. If this project were to be placed directly on a
server, it would be sufficient to point the host at this directory, however the contents can be
extracted and used elsewhere without issue, as after building the project is self-contained.
