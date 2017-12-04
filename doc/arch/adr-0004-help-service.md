Help Service
============

Context
-------

One of Temperate.io’s main selling features is the ability to communicate easily with a climate consultant at ICLEI, included in pricing. Users will likely be small-midsize municipal employees who aren’t expected to be technically independent, hence the appeal of guidance via Temperate.io.

Help Service Requirements:
- Simple communication workflow to connect users directly to ICLEI consultants
- Free/low cost & low maintenance on the backend
- Capture basic data:
    - datetime
    - current page/screen of app for user
    - org/user info
- Search and filter captured data
- Easy integration into Temperate (minimize work)


Summary table
-------------

|  Product  | Agent #   | # Customers | Cost/Year | Cost/Month | Data Support                        | Email Integration? |
|:---------:|-----------|-------------|-----------|------------|-------------------------------------|--------------------|
| Chat.io   | Per       | Unlimited   | $120      | $10        | Search/Filter                       | Future             |
| Intercom  | Unlimited | 250         | $636      | $53        | Full stats, search/filter platform  |                    |
| Livechat  | Unlimited | Unlimited   | $360      | $30        | Platform and 3rd party integrations |                    |
| Chatra    | Per       | Unlimited   | $180      | $19        | CSV export of visitor info          | Yes                |
| SmallChat | Unlimited | Unlimited   | $480      | $40        | CSV export limited info             |                    |
| Email     | Unlimited | Unlimited   | Free      | Free       | Basic search/filter                 | X                  |


Notes
-----
For more detailed notes: https://docs.google.com/document/d/1WGvVuqdgUkWOWBvBpkRB0tHczEm-gtVCQr0n8XUGHtk/edit#

Additional help service evaluations from the Hunchlab Team: https://docs.google.com/document/d/1_XxSPPsoPcWywAMnUYPWTtl7EKpqKSg2M2NVUtXgzI4/edit?ts=5a1d7a23#


- **For functionality**
The ideal product is definitely Intercom -- it’s agent UI is robust yet appears pleasing & easy-to-use. Joe from Raster Foundry gives it an “A”: I would just do Intercom and switch later if I had to, our experience has been great. $53 for unlimited agents, 250 customers. This slides reasonably upward with more users, but if we have that many paying customers, then great. It would be nice to have email integration come for free in Intercom, but it looks easy and pleasing enough to use that this may be ok.

- **For time**
While chat integrations looks fairly simple (drop in some javascript code; install, learn the agent UI platform), it will still take time. If a chat help service is not deemed necessary early, deferring and using email might seriously be preferable. This will allow us more time to focus on other feature-building for Temperate.

- **For, potentially, a middle-ground savings**
For price - functionality ratio, assuming < 5 agents, Chat.io is the recommended money-saving chat help option.


Decision
--------

For now, we will proceed with a basic email (e.g. support@temperate.io) for time savings to prefer building other features crucial for the MVP. Additionally, email is universally used and is therefore reliable to all potential Temperate.io clients. It presents hardly any implementation logistics. While the chat services were heavily considered, the Climate project's most limited resource is time right now. If there is time toward the end of the grant (April) to employ a chat service, we should revisit this to test out a chat help service.

Depending on the anticipated product-use, agent #, and funding we will decide between Chat.io and Intercom based on price or functionality, as outlined above. Each product has a 14 day free trial that can be implemented in close collaboration with our ICLEI consultants to test that live chat is a viable workflow for them.

Additionally, we shouldn't build chat now because we don't want to pay fees for the help service prematurely, especially since we are not sure about the long term financials or usage of Temperate.io.


Consequences
------------

The consequences of this decision are really simple in the immediate. The contact button in Temperate.io will just open up to an email. If we add a phone number, conversations will need to be catalogued. For now, the Urban Apps team will lose out on experience with chat help.

Because Intercom and Chat.io provide free 14 day trials, the Urban Apps should keep implementing them on the back-burner should time and $ resources allow the opportunity. The decision for Chat.io vs. Intercom will have to be made when the time comes.
