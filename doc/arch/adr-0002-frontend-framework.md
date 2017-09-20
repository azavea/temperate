Frontend Framework
==================

Context
-------

The application developed in collaboration with ICLEI will be a standalone product. Application development is expected to be compressed to a relatively short time scale, on the order of 6-8 months. Our grant funding the work expires at the end of April 2018, and if the application does not gain traction, it would be a reasonable expectation to sunset it.

Therefore, the largest factors influencing this decision are:
- Can we bootstrap to a working application quickly, without spending many hours configuring our development environment?
- Once bootstrapped, can we iterate on new features quickly?
- Does our choice provide implementations for, or make it easy for us to implement the features we expect to be building?
- Is it difficult for the team's developers, some who may not be particularly familiar or interested in client-side code, to be involved and make measurable contributions? What about if they are only irregularly contributing to the code?


We have a few options for developing the frontend for this application, listed here alphabetically:

1. [Angular](https://angular.io)
2. [ReactJS](https://facebook.github.io/react/)
3. [VueJS](https://vuejs.org/)

Angular
_______

Angular, developed by Google as a followup to angularjs, is a full-featured client side web framework written in TypeScript, a typed superset of JavaScript. Angular is a "batteries included" framework. It comes with a module system, HTTP library, routing, server side rendering, and a CLI out of the box that greatly improves app setup time. It renders HTML via templates, using "directives" to decorate DOM elements.

As of September 2017, Angular is approaching a release of version 5.0.0 which contains some breaking changes. The [Angular CLI](https://github.com/angular/angular-cli), used to quickly bootstrap Angular apps, is at version 1.4. While there were some rocky upgrades and major refactors when the CLI was first introduced, the CLI has not had any breaking backwards incompatible changes since 1.0. There is no guarantee that that won't change in the future, though.

The Urban Apps team has prior experience with Angular, having used it to develop the Cicero Live and Climate Lab applications. Neither project is large, but this prior experince would help inform ways to improve our workflows and bootstrap quickly. Some of the Climate Lab code could be reusable for this application, and using Angular here would avoid us having to re-write in a different framework.

Most frustrations with Angular revolve around "fighting the framework", cryptic and unhelpful error messages during development that are difficult to debug, or fighting package version mismatches. Some see TypeScript as an unnecessary burden, although we could mitigate this by actively choosing not to add types to our code as we start development. The third party package ecosystem exists, but is not nearly as robust as that of angularjs or React, and we may run into trouble finding high quality third party packages for some features we may want to implement.


ReactJS
_______

ReactJS is Facebook's very popular JavaScript view library. The React community has developed a set of addon libraries that provide functionality such as routing, http and data stores. Many of these plugins are "blessed" by the community, but they are not an official part of React. In practice, this seems to have little effect due to the size of the community -- updates are quick and generally developed in the same spirit as React.

HTML in React is written via JSX, a JavaScript syntax extension that compiles to React code. Choosing React would require developers to become familiar with this syntax and configure their editor of choice to support it. All of the popular editors have battle-tested plugins that provide JSX syntax highlighting and linting.

React has generally had a pretty good API contract, and while there are breaking changes, they tend to be minor with appropriate lead time from the core team. It is unknown whether this is the case with each of the associated 3rd party libraries necessary for a fully-functioning SPA.

For a very long time, React did not provide a CLI or template project that got developers going quickly. Starting a React project required copying an existing, potentially outdated, configuration from someone else, or digging into one of the various build tools (e.g. grunt, gulp, webpack) to figure out how to compile React/JSX in multiple environments. This has largely been mitigated by Facebook's release of the `react-create-app` tool. This tool can be used to quickly bootstrap a new React project with compilation, testing and linting. Upgrades to the build configuration are generally straightforward, as the `react-scripts` project that `react-create-app` provides a migration guide between each release.

React is currently the most popular of the three options presented here, as measured by [NPM downloads and GitHub stars](#library-popularity). While not necessarily a reason to choose it, it does mean that React and its associated community have tons of how-to material and related libraries for pretty much anything a developer would want to implement. In addition, React has seen widespread use on the Civic Apps team at Azavea, which is an additional learning resource we could use.

React had some trouble recently when the Apache Software Foundation (ASF) added the Facebook BSD+Patents license to their "Category X" list. While the Facebook BSD+Patents license used by React is likely not an issue for us, React may not be a strong long term choice based on the more restrictive license. For more information, see:
- [Explaining React's license](https://code.facebook.com/posts/112130496157735/explaining-react-s-license/)
- [Consider re-licensing to Apache v2.0](https://github.com/facebook/react/issues/10191)


VueJS
_____

VueJS sits somewhere between the two big JS players mentioned above. It is much lighter weight than Angular, but has first-party implementations of some of the core features required by a JS framework, such as view routing and data stores. Vue promises a "scalable, incrementially adoptable" API that is performant and quick to get started with. Unlike Angular or React, is is possible to realistically add a minified copy of the Vue framework to a static HTML page and immediately start writing code.

VueJS includes a first party [Vue CLI](https://github.com/vuejs/vue-cli) which allows instantaneous bootstrapping of a new client-side Vue app after answering a few interactive configuration questions. The Vue CLI supports different bootstrapping templates, although the standard webpack option would seem complete for our needs.

VueJS utilizes HTML templates, and a template syntax similar to Angular's that is slightly less arcane while seeming a bit more extensible. VueJS also uses Components and Directives in the same way as Angular -- it feels fairly similar at a high level. The major code difference is that Vue prefers to define all of the HTML, CSS and JS (and derivatives like SASS or TypeScript) in single file `.vue` files that look like:
```
<template>
  <span class="hello">Hello, {{ name }}!</span>
</template>

<script>
export default {
  name: 'World'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
span {
  color: #42b983;
}
</style>
```

These templates, at least when compiled using the default Vue CLI configuration, integrate well with additional options, such as SASS and TypeScript.

For a more complete example of VueJS in use, demoing most of the major features of VueJS, see this [HackerNews clone](https://github.com/vuejs/vue-hackernews-2.0).

As of the time of this writing, VueJS is not used in any project at Azavea.


Library Popularity
__________________

Popularity of the three options as of Sept 2017.

| Library | NPM Downloads (monthly) | GitHub stars |
|---------|-------------------------|--------------|
| Angular | [1,635,000](https://www.npmjs.com/package/@angular/common) | 28,000 |
| ReactJS | [4,977,000](https://www.npmjs.com/package/react) | 76,000 |
| VueJS   | [720,000](https://www.npmjs.com/package/vue) | 67,000 |


Decision
--------

We will proceed forward by continuing to use Angular. The Urban Apps team already knows the framework which should allow us to iterate quickly on the short time scales required of the project. TypeScript, while potentially slightly slowing initial development time, should help us to quickly and efficiently refactor the application when necessary as we move along in the project. We can also choose to mostly eliminate our use of TypeScript, if we feel it slows development down.

ReactJS would have significantly higher spin-up times and learning costs. While in use by other teams at Azavea, React is only a view library. In addition to becoming comfortable with JSX, we would need to choose and learn a series of third party libraries for additional framework components such as routing and data management.

VueJS was more heavily considered. While likely far too simple a comparison, VueJS feels like a very lightweight Angular. The HTML template languages, and the general framework Component-based design philosophies are very similar, and they both provide a CLI to quickly begin development. Urban Apps developers should have little trouble initially transitioning from Angular to VueJS. With that said, VueJS was not chosen at this time due to the short timeline of the project. The additional spin-up would still be costly, and knowledge retention of a new framework might be difficult, as most developers working on the application will not be doing so full-time. This could lead delays that easily offset any long-term gains from choosing VueJS.


Consequences
------------

The consequences to this decision are fairly straightforward. The Urban Apps team will be able to iterate using a framework that we have some familiarity with, and hopefully iterate quickly on the new application without running into too many framework related roadblocks. We feel fairly confident that we will be able to develop in Angular without having to deal with too many breaking API changes over the course of the next 6-8 months.

Choosing Angular over VueJS was a more difficult decision than expected. Urban Apps developers have generally preferred a more opinionated, "batteries-included" framework, but Angular feels _very_ heavy and opinionated. VueJS has all of the key batteries included but provides more flexibility in how to construct applications, remains very fast, and does not require TypeScript. VueJS may be an excellent choice for another Urban Apps project sometime in the coming year.
