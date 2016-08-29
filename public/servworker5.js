/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

// Version 0.1

'use strict';

// console.log('Started', self);
self.addEventListener('install', function(event) {
  self.skipWaiting();
  console.log('Installed');
});

// self.addEventListener('activate', function(event) {
//   console.log('Activated', event);
// });

// self.addEventListener('push', function(event) {
//   console.log('Push message', event);

//   var title = 'Push message';

//   event.waitUntil(
//     self.registration.showNotification(title, {
//       'body': 'The Message',
//       'icon': 'images/icon.png'
//     }));
// });

// self.addEventListener('notificationclick', function(event) {
//   console.log('Notification click: tag', event.notification.tag);
//   // Android doesn't close the notification when you click it
//   // See http://crbug.com/463146
//   event.notification.close();
//   var url = 'https://youtu.be/gYMkEMCHtJ4';
//   // Check if there's already a tab open with this URL.
//   // If yes: focus on the tab.
//   // If no: open a tab with the URL.
//   event.waitUntil(
//     clients.matchAll({
//       type: 'window'
//     })
//     .then(function(windowClients) {
//       console.log('WindowClients', windowClients);
//       for (var i = 0; i < windowClients.length; i++) {
//         var client = windowClients[i];
//         console.log('WindowClient', client);
//         if (client.url === url && 'focus' in client) {
//           return client.focus();
//         }
//       }
//       if (clients.openWindow) {
//         return clients.openWindow(url);
//       }
//     })
//   );
// });

// self.addEventListener('pushsubscriptionchange', function(event) {

// }

self.addEventListener('push', function(event) {
  console.log("PUSH");
  console.log(event);
  console.log(sub);
  event.waitUntil(
    fetch("/api/getonenotification").then(function(response) {
      console.log(response);
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);   
      } else {
        return response.json().then(function(data) {
          console.log(data);  
          var title = "Good Job";
          var message = "Good Message";  
          var icon = "/images/common/logo.svg";  
          // var notificationTag = data.notification.tag;

          return self.registration.showNotification(title, {  
            body: message,  
            icon: icon,  
            // tag: notificationTag  
          });  
        })  
        .catch(function(err) {  
        console.error('Unable to retrieve data', err);

        var title = 'Give For Free';
        var message = 'You have received a notification.';  
        var icon = "/images/common/logo.svg";  
        var notificationTag = 'notification-error';  
        return self.registration.showNotification(title, {  
            body: message,  
            icon: icon,  
            tag: notificationTag  
          });  
      })
      }
    })
  );
  // console.log(event);
  // self.registration.showNotification();
  // console.log(event);
  // console.log("HELLO");
  // console.log('Received push');
  // let notificationTitle = 'You have been given an item!';
  // console.log(notificationTitle);
  // const notificationOptions = {
  //   body: 'GREAT BOSS.',
  //   icon: '/images/common/logo.svg',
  //   tag: 'simple-push-demo-notification',
  //   data: {
  //     url: 'localhost:8080'
  //   }
  // };

  // if (event.data) {
  //   const dataText = event.data.text();
  //   notificationTitle = 'Received Payload';
  //   notificationOptions.body = `Push data: '${dataText}'`;
  // }

  // event.waitUntil(
  //   Promise.all([
  //     self.registration.showNotification(
  //       notificationTitle, notificationOptions),
  //     // self.analytics.trackEvent('push-received')
  //   ])
  // );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  let clickResponsePromise = Promise.resolve();
  if (event.notification.data && event.notification.data.url) {
    clickResponsePromise = clients.openWindow(event.notification.data.url);
  }

  event.waitUntil(
    Promise.all([
      clickResponsePromise,
      // self.analytics.trackEvent('notification-click')
    ])
  );
});
// self.addEventListener('notificationclose', function(event) {
//   event.waitUntil(
//     Promise.all([
//       // self.analytics.trackEvent('notification-close')
//     ])
//   );
// });
