/**
 * Common database helper functions.
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}


function openIndexedDB (){
  if (!'serviceWorker' in navigator) return ;

  indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  if (!indexedDB) {
    console.error("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
  }
  const openRequst = indexedDB.open('restaurants', 2);
  openRequst.onupgradeneeded = function(event) {
    idb = event.target.result;
    idb.createObjectStore('restaurant', {
      keyPath: 'id'
    });
    idb.createObjectStore('reviews', {
      keyPath: 'id'
    });
  }
  return openRequst ;
}
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
     const remote = `https://reviews-server.tt34.com/restaurants`;
    return `http://localhost:${port}/restaurants`;
  }

  static get REVEIWS_DATABASE_URL(){
  const port = 1337 // Change this to your server port
     const remote = `https://reviews-server.tt34.com/reviews`;
    return `http://localhost:${port}/reviews`;
  }

 static fetchRestaurantsAgain() {
let xhr = new XMLHttpRequest();

 const openIDB = openIndexedDB();
 xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const restaurants = JSON.parse(xhr.responseText);   
       

        openIDB.onsuccess = (event)=> { 
          const idb= event.target.result;
          const objectStore = idb.transaction('restaurant', 'readwrite').objectStore('restaurant');
          restaurants.forEach(restaurant => {
            objectStore.add(restaurant);
          });
        }
        openIDB.onerror = (error)=> { 
          console.error('IDB is not opened');
        }
       
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
       
      }
    };
    xhr.send();





/*fetch(DBHelper.DATABASE_URL,{method:'GET'})
      .then(response=>response.json()
   
 .then(function (restaurantsTest){


  console.log(restaurantsTest);

var dbPromise = idb.open('restaurantDB',1, function (upgradeDB){

const restaurantsStore = upgradeDB.createObjectStore('restaurant', {
      keyPath: 'id'
    });

 restaurantsTest.forEach(restaurant => {
            restaurantsStore.add(restaurant);
          });

});
        }))
*/


    
} 

  /**
   * Fetch all restaurants.bv
   */  
     static fetchRestaurants(callback) {


    fetch(DBHelper.DATABASE_URL,{method:'GET'})
      .then(response=>response.json() 
      .then(callback)      
       )  
DBHelper.fetchRestaurantsAgain();
}
 
    
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((restaurants, error) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((restaurants, error) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((restaurants, error) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((restaurants, error) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((restaurants, error) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
 static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } 

  static addReview(review) {
        debugger;
        const offlineReview = {
            name: 'addReview',
            data: review,
            object_type: 'review'
        }
        if (!navigator.onLine) {
            DBHelper.sendOnline(offlineReview);
            return Promise.reject(offlineReview);
        }
        return DBHelper.sendReview(review)
    }

    static sendReview(review) {
        debugger;
        const Review = {
            "name": review.name,
            "rating": review.rating,
            "comments": review.comments,
            "restaurant_id": review.restaurant_id
        }
        const Options = {
            method: 'POST',
            body: JSON.stringify(Review),
        };

        return fetch(`${DBHelper.REVEIWS_DATABASE_URL}`, Options)
    }


static sendReviewWhenOnline(offlineReview){ 
     console.log('event Listin');
     
    localStorage.setItem('reviews', JSON.stringify(offlineReview.data));
    window.addEventListener('online', (event)=>{
      console.log('Now I am Online ...... ');
      
      const review = JSON.parse(localStorage.getItem('reviews'));
      let  offlineReviewUI = document.querySelectorAll('.reviews-offline');
      offlineReviewUI.forEach(el=>{
        el.classList.remove("reviews-offline");
        el.removeChild(document.getElementById('offline-lable'));
      });
      if (review) {
        DBHelper.addReview(review);
      }
      localStorage.removeItem('reviews');
    })
   }


       static fetchRestuarantReviews(id) {
        return fetch(`${DBHelper.REVEIWS_DATABASE_URL}/?restaurant_id=${id}`)
            .then(res => res.json()).then(reviews => {
                var request = indexedDB.open('ReviewsDB', 1);
                request.onerror = function (event) {
                    alert("Database error: " + event.target.errorCode);
                };
                request.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    var objectStore = db.createObjectStore("reviews", { keyPath: "id" });
                    objectStore.transaction.oncomplete = function (event) {
                        var reviewObjectStore = db.transaction("reviews", "readwrite").objectStore("reviews");
                        reviews.forEach(function (review) {
                            reviewObjectStore.add(review);
                        });
                    };
                };
                return reviews;
            })
    }





 static changeFavoriteStatus (resturantId, newStatus) { 
    fetch(`${DBHelper.DATABASE_URL}/${resturantId}/?is_favorite=${newStatus}`, {
      method: 'PUT'
    }).then(()=>{
    const openIDB = openIndexedDB();
      openIDB.onsuccess = (event)=> {
        const idb= event.target.result;
             const objectStore = idb.transaction('restaurant', 'readwrite').objectStore('restaurant');
        const dbGetRequest = objectStore.get(resturantId);
        dbGetRequest.onsuccess = event =>{
           const restuarant = event.target.result;
          console.log(restuarant);
          restuarant.is_favorite = newStatus;
          objectStore.put(restuarant);
        }
  
      }
    })
  }

    






}

