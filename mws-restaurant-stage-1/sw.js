const cache = "res-v1";

self.addEventListener('fetch',(event) => {
  console.info('Event : Fetch');
  var request = event.request;
  event.respondWith(
 caches.match(request).then((response) => {

if(response){

  return response;
}


return fetch(request).then((response) => {

  var responseToCache = response.clone();

  caches.open(cacheName).then((cache) =>
  {

    cache.put(request,responseToCache);
  }

  return response;
});

}) 


    );
});