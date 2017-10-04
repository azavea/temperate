# Authentication Methods :closed_lock_with_key:

## Context

The application developed in collaboration with ICLEI will be a standalone product. Application development is expected to be compressed to a relatively short time scale, on the order of 6-8 months. Our grant funding the work expires at the end of April 2018, and if the application does not gain traction, it would be a reasonable expectation to sunset it.

We are building an application with a [Django REST Framework](http://www.django-rest-framework.org/) (DRF) server and an Angular front-end application that will use the DRF API. The server and front-end application will be deployed into separate Docker containers on [Amazon Web Services](https://aws.amazon.com/) that will be able to scale to multiple instances, hosted on the same instance, or hosted on separate instances.

Some factors influencing this decision include:
- What options can we set up quickly that will support development work and production use?
- What options will support our anticipated use cases and deployment environment?
- How secure are these authentication methods relatively?
- How complex would the implementation be to support our environments and use cases?
- How difficult would it be for us to change or expand authentication options in future?
- What are the costs of the option?

Authentication options include:

1. [Session Based](#session-based)
2. [Token Based](#token-based)
3. [OAuth2](#oauth2)
4. [JWT](#jwt)
5. [Auth0](#auth0)

Authentication methods are not exclusive. It is possible for the Django server in this application to support multiple authentication methods, even all of those considered here. For example, in the [DRIVER](https://github.com/WorldBank-Transport/DRIVER/blob/master/app/driver_auth) project, the Django server provides a combination of token-based, session-based, and OAuth2 authentication. Authenticating via OAuth2 (using the [OpenID Connect](http://openid.net/connect/) identity layer on top of OAuth2) for that application then sends to the client the same API token as would be returned after logging in via username and password.


#### Session Based

Django provides a [built-in session authentication method](https://docs.djangoproject.com/en/1.11/topics/http/sessions/) that is configured by default for new applications. Currently, the Django application for this project uses this method, which is cookie-based. Session authentication allows for logging in to the Django administrative site and/or the Django Rest Framework's API browser site.

Session-based authentication is not RESTful and therefore not appropriate for use with an API, as session management introduces state, and [REST APIs should be stateless](http://www.restapitutorial.com/lessons/whatisrest.html#). That is one reason why we should not use session authentication querying the API from the front-end application. Another reason is that scaling the application may become more complicated when cookies are in use, as use of an efficient [cache-based session backend](https://docs.djangoproject.com/en/1.11/topics/http/sessions/#using-cached-sessions) in production would require adding a cache backend, which according to the Django documentation, should use the Memcached backend. With either a cache or database backed session store, tracking sessions will increase server memory usage.

Since session authentication uses cookies, it can be vulnerable to [CSRF attacks](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)), which [Django protects against](https://docs.djangoproject.com/en/1.11/ref/csrf/) with middleware and a template token. As we will not be using Django templates, our front-end application would have to set the CSRF cookie itself.

We may wish to leave session-based authentication enabled in the development environment so we can continue to use the DRF API browser and/or the Django administrative site for easy debugging and faster development cycles. Session authentication for the front-end application, however, will only be suitable as long as the front-end Angular app and the Django server are hosted from the same domain, and may complicate scaling, due to the need to track sessions server-side.


#### Token Based

Token-based authentication is a stateless means for a client to authenticate against an API when making a request by passing a string token, either as a header or in the URL. This is most widely used method for authenticating API requests.

Generally for our applications featuring a DRF API and a separate front-end site, we have used token authentication. It is [supported by the DRF library](http://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication) and we have multiple implementation examples to look to in other projects that we have done. For client applications, generally the user logs in via a username (or email) and password, then the server sends the client the API key to be passed along in subsequent requests.

The client may store the token in a cookie or in local storage on the browser, and so may be vulnerable to CSRF or [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting).

API tokens may also be provided to users who wish to query the API directly, outside of the front-end application. A downside is that the tokens do not expire, and so could be abused for an extended period of time if compromised. In other applications with API tokens, we have provided the user with the option to generate a new API token in the website interface, which would make the old token invalid.


#### OAuth2

[OAuth2](https://oauth.net/2/) is an authorization protocol that delegates user authentication to a service hosting an account for that user. It is the protocol that allows websites to let users "log in with Google" or other accounts they may already have with external services. Other notable OAuth2 service providers include Facebook and GitHub.

For our purposes, it is unlikely that we would want to be an OAuth2 provider (let other sites log in users via a pre-existing account with our site), but we may wish to use OAuth2 as a client (let our users log in to our site using accounts they already have elsewhere).

The primary benefit of implementing OAuth2 lies in simplifying signup and login for our users. Since authorization is handled externally, there is no need to send confirmation emails on new account creation or for the user to enter a password for our site. If the user is already logged in to the other service, logging in to our site can be done with a single button click. OAuth2 is particuarly useful in developing mobile applications, as the device can centrally store the user's OAuth2 provider account credentials, and also because typing in username and password is particularly onerous on a mobile device.

In terms of implementation however, OAuth2 is more complicated than other methods. There are separate configurations that need to be set up for each provider that are not always easy to discover or debug. For implementation in Django, we would have to use third-party libraries. One of the [core libraries for that](https://github.com/OpenIDC/pyoidc/) proved to be somewhat unstable in implementing OAuth2 for the DRIVER application.


#### JWT

JWT, or [JSON web token](https://jwt.io/), is a standard for authentication via digitally signed JSON objects. JWT may also be used for secure exchange of data beyond for authentication. The token consists of a header, the payload, and a signature, passed as three dot-separated, base 64 encoded strings.

Typically the tokens are kept in the client browser's local storage, but cookies may used instead. The client passes the token with a request by using the `Authorization` header with the `Bearer` schema, which has the benefit of being stateless (the server does not need to track user state).

The token may be read by the client. This can be beneficial for easy debugging, but potentially introduces security risk.

Token generation for JWT can be decentralized. We are unlikely to have a use case for doing so, however.

JWT contains an expiration time for the token. The tokens may be short-lived or long-lived. Implementations of JWT are often short-lived, to take advantage of the security benefit that presents over [long-lived API tokens](#token-based). The security benefit of rapidly expiring tokens is that if the token is compromised, it can only be exploited for a short period. However, handling the life cycle of short lived tokens on the client presents complications in implementation: it becomes necessary to check the token status before making a request, renew the token if it will expire soon, and also to handle the case that the user has not make another request within the token's valid period and the token has expired. This might result in users having to log back in again frequently.

For a JWT implementation with long-lived tokens, the server side implementation becomes more complicated as it will become necessary to implement token blacklists, which negates the benefit of JWT otherwise being stateless.

As JWT supports the OAuth2 standard, it may be possible to use JWT with OAuth2, so those two methods are not mutually exclusive options.

There are DRF-compatible third party libraries for [JWT in Django](http://www.django-rest-framework.org/api-guide/authentication/#json-web-token-authentication).


#### Auth0

Use of more complicated authentication protocols (those other than session or token based methods) may be made easier by use of a third-party service such as [Auth0](https://auth0.com).

Auth0 is a [subscription](https://auth0.com/pricing) service that handles user management and signup, API tokens, and authorization via multiple methods, including JWT and OAuth2. It can provide streamlined user signup and login flows that we would not have to create or maintain.


## Decision

We will implement [token-based authentication](#token-based) for now, as it will be relatively straightforward to do and should support our use-cases sufficiently for production use. We can leave session authentication enabled in the development environment so we may continue to access the Django admin site and/or the REST API browser site. We can authenticate front-end app requests with username/password to obtain the user's API token. Should demand arise later for OAuth2 authentication, we can extend our existing application to add that option without needing to modify or remove the other authentication options.

Although JWT may be beneficial for us in terms of security by providing rapid expiry cycles, the additional difficulty of implementation both server and client side makes it a less attractive option for our initial MVP. Should reasons arise to switch to JWT later, that will remain an option that should not be made any more difficult by having a pre-existing [token-based authentication](#token-based) setup.

For all of these options, the client site should be served over HTTPS. For authentication options involving tokens, which are token-based authentication, JWT, and a token-based implementation of OAuth2, SSL will be necessary to keep the token secure as it is passed to and from the client. For all options other than OAuth2 single sign-on, SSL should be used to protect the username and password transmitted to the server to log in. So generally, the production site should use SSL for secure authentication, particularly in token protection.


## Consequences

It is entirely possible for the application to use multiple authentication methods. Apart from changing to or from session authentication, switching between the other options for the API should have no particular costs or implications beyond the implementation of that method itself, so should we need to change or add methods later, doing so should not present any more difficulties than it would doing so earlier.
