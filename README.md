Integrated website for convenient living for the elderly
In this era of increasing digitalization, more electronic products, and digital products are appearing. To be able to bring convenience to the elderly and really be able to allow the elderly to use these products flexibly, to ensure that these products can bring convenience to the life of the elderly, to maintain good health, and to keep in touch with society. 

Project documentation:


Development is divided into three phases
Checkpoint 1:
UI wireframe and functional concept design
[https://www.figma.com/design/XYMJFNv5PTutKwifCXXMBN/BED-asg-1?node-id=0-1&p=f&t=itj5mw5R0VklWArZ-0](https://www.figma.com/design/XYMJFNv5PTutKwifCXXMBN/LionBeFriender?node-id=0-1&t=GcxtEugcuRy8bZQU-1)


Checkpoint 2:
Back-end functional development, including at least one get function and post/update/delete functions
Functionality demonstration at this stage


Checkpoint 3:
Complete functional development, integration of all functions, code testing, and release



External API :
FengFan:
## Eventbrite Integration

This project integrates Eventbrite API with MSSQL to fetch and store events.

### Setup
1. Ensure MSSQL is running locally or use a cloud instance.
2. Add to `.env`:
   ```plaintext
   EVENTBRITE_TOKEN=your_eventbrite_oauth_token





Project Documentation:

Design Background 
 
In this era of increasing digitalization, more electronic products, and digital products are appearing. To be able to bring convenience to the elderly and really be able to allow the elderly to use these products flexibly, to ensure that these products can bring convenience to the life of the elderly, to maintain good health, and to keep in touch with society. 

Design Requirements: 
The development and design of the website should be based on the following to meet the needs of seniors 
 
•	Simplicity: the design is simple, convenient and easy to understand and use 
•	Multi-tips: design system functions should have more tips to remind the elderly how to operate, and there are guidelines for each step. For example, when loading the page waiting time, the system prompts the elderly to please wait. When changing personal information, prompting the need to enter something specific. 
•	Humanized settings: set up a convenient UI for the elderly, with large fonts. More sensitive system interaction buttons, such as buttons that are easy to click to trigger. 
•	Personalized language: Language should be used that is straightforward and easy to understand. Friendly language. 
  
Overview: 
Socialization is a vital aspect of an elderly person’s well-being. By providing features that help elders connect based on shared interests, join meaningful activities, and maintain communication, the platform fosters emotional fulfillment and community belonging. Through event management, chat systems, and intelligent friend suggestions, elderly users can stay engaged and supported. 
 
My features: 
1. Event Management 
Allows elderly users to explore, sign up for, or cancel participation in events tailored to their hobbies and interests, creating opportunities for social interaction. 
CRUD Operations: 
•	Read: 
GET to fetch a list of available events or specific event details by event_id 
•	Create: 
POST to add an event record in the user_event table when a user signs up 
•	Delete: 
DELETE to remove an event from the user’s registered list in the user_event table 
 
2. Chatting 
Provides seniors with messaging capabilities for both one-on-one and group interactions, allowing them to stay connected with friends and groups of interest. 
Friend Chatting - CRUD Operations: 
•	Create: 
POST to send a message to the private chat table 
•	Read: 
GET to retrieve the latest messages by chat_id, with newest chats loaded at the bottom 
Group Chat - CRUD Operations: 
•	Create: 
POST to send a message to the group chat table 
•	Read: 
GET to retrieve group messages by chat_id, loaded in chronological order 
 
3. Get Eventbrite Events 
Expands social opportunities by allowing users to view and join events pulled from Eventbrite, offering a wider range of activities. 
CRUD Operations: 
•	Read: 
GET to display a list of upcoming Eventbrite events on the platform 
•	Create (via Update routes): 
PUT/PATCH to register a user for a selected Eventbrite event and log it in the user_event table 
 
4. Friend / Group Management 
Empowers users to manage their friend lists and group memberships, supporting relationship building and easy reorganization. 
CRUD Operations: 
•	Create: 
POST to add a new user as a friend 
•	Read: 
GET to retrieve details about friends and group memberships 
•	Update: 
PUT/PATCH to edit friend or group information (e.g., nickname or group name) 
•	Delete: 
DELETE to remove a friend or exit a group 
 
5. Friend Recommendations 
Shows seniors potential friends who share common hobbies or interests, encouraging new connections. 
CRUD Operations: 
•	Create: 
POST to add a recommended user as a new friend 
•	Read: 
GET to display user suggestions including name, interests, and compatibility 
Overview: 
To encourage elderly engagement and reward participation, a point-based video and voucher system has been designed. Elders can earn points by completing video tasks and redeem them for useful vouchers. A transparent history and record system ensures they can view and manage their transactions with ease. 
My features: 
1. Video Tasks (Earning Points) 
Elders earn points by watching and completing exercise or educational videos designed to promote physical and mental well-being. 
CRUD Operations: 
•	Create: POST video completion to award points 
•	Read: GET available videos; GET current point status 
•	Update: PUT/PATCH to update video progress 
•	Delete: N/A (video points are not typically deleted once awarded) 
 
 
2. Points System 
Tracks and manages points earned from various activities, and deducts points upon voucher redemption. 
CRUD Operations: 
•	Create: POST to add points after completing valid activities 
•	Read: GET current point balance; GET detailed points transaction history 
•	Update: PUT/PATCH to adjust points (e.g., after voucher redemption or correction) 
•	Delete: DELETE points record (admin-only use for error correction) 
 
3. Voucher Redemption & Storage 
Allows elders to redeem accumulated points for vouchers, which are stored for future use or presented at partner outlets. 
CRUD Operations: 
•	Create: POST to redeem a voucher and store it in the system 
•	Read: GET list of available vouchers; GET redeemed vouchers for a user 
•	Update: PUT/PATCH to mark a voucher as used, expired, or update voucher details 
•	Delete: DELETE a voucher redemption if it was cancelled before use 
 
4. Record Management (History) 
Maintains a transparent record of all point and voucher-related activities, enabling users to trace their earning and spending history. 
CRUD Operations: 
•	Create: POST new transaction records when points are earned or vouchers redeemed 
•	Read: GET complete history of point earnings, redemptions, and voucher usage 
•	Update: PUT/PATCH to modify existing history entries for corrections 
•	Delete: DELETE a history entry (admin-only, for special cases) 

Overview: 
To ensure a seamless and personalized experience for elderly users, the platform provides secure user account management, profile customization, and multilingual support. These foundational features promote accessibility, autonomy, and a more comfortable onboarding process for seniors. 
My features: 
1. User Account Management (Register & Login) 
Allows seniors to securely register and log in to the platform with minimal confusion, ensuring easy access to personalized services. 
CRUD Operations: 
•	Create: POST to create a new account with name, email, and password 
•	Read: GET user profile information after login 
•	Update: 
o	POST to authenticate user credentials during login 
o	GET to end session and log out securely 
•	Delete: DELETE account (admin-only access) 
 
2. Profile Setup & Editing 
Enables users to personalize their experience by setting up or modifying profile information such as age, interests, and hobbies. 
CRUD Operations: 
•	Create: POST to create user profile upon first login 
•	Read: GET current profile details 
•	Update: UPDATE to modify personal information (e.g., hobbies, age) 
•	Delete: DELETE profile (admin-only access) 
 
3. Language Settings 
Supports accessibility by allowing users to select their preferred app language (English, Mandarin, Malay, or Tamil). 
CRUD Operations: 
•	Create: POST to save the user’s initial language preference 
•	Read: GET preferred language setting from profile 
•	Update: UPDATE to change language selection anytime 
 
Overview: 
To promote medication adherence and simplify daily tracking, the platform includes a medication management module. It allows seniors and caregivers to record prescriptions, visualize schedules through a calendar, and log intake history — ensuring both routine and accountability. 
My features: 
1. Add Medication 
Allows users (e.g., elders or caregivers) to input daily medication routines, including dosage, timing, and duration. This information is stored and used in various modules such as the calendar and history view. 
CRUD Operations: 
•	Create: 
o	POST /medications 
o	Accepts fields: name, dosage, instructions, time, start_date, end_date, user_id 
o	Validates input via Joi schema before storing in the database 
•	Read: 
o	GET /medications 
o	Returns a list of active medications for display in the dashboard and calendar 
 
2. Medication Calendar 
Displays medications visually on a calendar (via FullCalendar.js), helping users understand when and how long to take medications. 
CRUD Operations: 
•	Read: 
o	GET /medications 
o	Medications are mapped to calendar events using start_date, end_date, and time 
o	The calendar is display-only — users cannot interact directly with events 
 
3. Medication History 
Logs whenever a medication is marked as taken, helping track compliance and creating a record of daily intake. 
CRUD Operations: 
•	Create: 
o	POST /medications/:id/mark 
o	Creates a history entry with taken_at timestamp and medication_id when a user marks medication as taken 
•	Read: 
o	GET /medications/history 
o	Retrieves a chronological list of taken medications for history display 
Overview: 
To support elderly users in maintaining a healthy lifestyle, this set of features includes meal logging, calorie tracking, intelligent food suggestions, and weather-aware alerts. Designed with accessibility in mind, the system uses large fonts, minimal interaction steps, and intelligent recommendations based on health data and environmental factors. 
My features: 
1. Food Tracking and Calorie Monitoring 
Enables seniors to log their meals, monitor calorie intake, and receive real-time nutritional insights to support better dietary habits. 
CRUD Operations: 
•	Create: 
POST to add new food entries with meal type, food name, and quantity 
•	Read: 
GET today’s food logs and compute total calorie intake 
•	Update: 
PUT to modify meal entries (e.g., adjust quantity or change food item) 
•	Delete: 
DELETE to remove an item from the food log 
 
2. Daily Food Recommendation 
Provides tailored meal suggestions based on remaining daily calories, helping users avoid over- or under-eating. 
CRUD Operations: 
•	Create: 
POST is automatically triggered after logging a meal 
•	Read: 
GET to retrieve meal suggestions based on calories left for the day 
•	Update: 
PUT to regenerate suggestions if a meal log is updated 
•	Delete: 
N/A (Suggestions are dynamically generated and not stored) 
 
3. Today’s Meal History Management 
Allows users to view and manage meals logged within the same day, providing flexibility for adjustments or corrections. 
CRUD Operations: 
•	Create: 
POST automatically creates an entry when a meal is logged 
•	Read: 
GET to display a list of today’s meal records 
•	Update: 
PATCH to modify meal timing 
•	Delete: 
DELETE to remove specific food logs from today’s history 
 
4. Food Search with Autocomplete 
Improves user experience by offering food name suggestions while typing, minimizing spelling mistakes and effort. 
CRUD Operations: 
•	Create: N/A 
•	Read: 
GET to fetch matching food items as the user types 
•	Update: N/A 
•	Delete: N/A 
 
5. Weather Forecast Assistance 
Provides up-to-date weather and short-term forecasts to help seniors plan daily activities with safety in mind. 
CRUD Operations: 
•	Create: N/A 
•	Read: 
GET to fetch current weather using geolocation 
GET to retrieve short-term forecast (e.g., 2-hour window) from external APIs 
•	Update: N/A 
•	Delete: N/A 
 
6. Weather Alert Preference Form 
Allows users to submit weather alert preferences, such as receiving reminders before it rains or when it’s too hot, enhancing safety and preparedness. 
CRUD Operations: 
•	Create: 
POST to submit preferred alert type and advance notification time 
•	Read: 
GET to view submitted alert preferences tied to the user profile 
•	Update: N/A 
•	Delete: 
DELETE to remove an existing alert preference 
 


