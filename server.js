// Importeer het npm pakket express uit de node_modules map
import express from 'express'

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// Stel het basis endpoint in
const apiUrl = 'https://redpers.nl/wp-json/wp/v2';


// Maak een nieuwe express app aan
const app = express()

// Stel ejs in als template engine
app.set('view engine', 'ejs')

// Stel de map met ejs templates in
app.set('views', './views')

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static('./public/'))

app.use(express.urlencoded({extended:true}))

// app.locals.hardcodedCategories = {
//   'binnenland': 9,
//   'buitenland': 1010,
//   'column' : 7164,
//   'economie':6,
//   'kunst-media':4,
//   'podcast':3211,
//   'politiek':63,
//   'wetenschap':94
// }



app.locals.hardcodedCategories = {
    'binnenland': 9,
    'buitenland': 1010,
    'column' : 7164,
    'economie':6,
    'kunst-media':4,
    'podcast':3211,
    'politiek':63,
    'wetenschap':94
  }

  // hardcodedCategories.binnenland

// hardcodedCategories[request.params.categorySlug]




// Maak een GET route voor de index
app.get('/', function (request, response) {
  // Haal alle personen uit de WHOIS API op
  const postsUrl = `${apiUrl}/posts?per_page=27`;
  const usersUrl = `${apiUrl}/users`;
  const categoriesUrl = `${apiUrl}/categories?per_page=100`;
  
  let categories = {
    7164: {title: 'Column', posts: []},
    9: {title: 'Binnenland', posts: []},
    6: {title: 'economie',posts:[]},
    1010: {title: 'buitenland',posts:[]},
    4: {title: 'kunst-media',posts:[]},
    3211: {title: 'podcast',posts:[]},
    63: {title: 'politiek',posts:[]},
    94: {title: 'wetenschap',posts:[]}
   
    
  }
 
  // Foreach categories key, fetch the next URL, 
  // https://redpers.nl/wp-json/wp/v2/posts?categories=7164&per_page=3
  // And put the response of that fetch inside categories[...].posts
    // https://redpers.nl/wp-json/wp/v2/posts?categories=9&per_page=3
 
  Promise.all([fetchJson(postsUrl), fetchJson(usersUrl),fetchJson(categoriesUrl)])
  .then(([postsData, usersData, categoryData]) => {
      // Render index.ejs and pass the fetched data as 'posts' and 'users' variables
      response.render('index.ejs', { posts: postsData, users: usersData, categories: categoryData  });
      console.log("home success")
  })

  .catch((error) => {
    // Handle error if fetching data fails
    console.error('Error fetching data:', error);
    response.status(500).send('Error fetching data');
});

})
 


////////////// post route per id 
app.get('/posts/:id', function (request, response) {
  // Fetch the post with the given id from the API
  const postId = request.params.id;
  const categoriesUrl = `${apiUrl}/categories?per_page=100`;

  
  Promise.all([
    fetchJson(`${apiUrl}/posts/${postId}`),
    fetchJson(categoriesUrl)
  ]).then(([postData, categoryData]) => {
      // Render post.ejs and pass the fetched data as 'post' variable
      response.render('posts.ejs', {
        post: postData,
        categories: categoryData
      });
      console.log("post succes")
  }).catch((error) => {
      // Handle error if fetching data fails
      console.error('Error fetching data:', error);
      response.status(404).send('Post not found');
  });
});

///////////// author route per id
app.get('/author/:id',function(req,res){
  // the data i need for this page
  const postsUrl = `${apiUrl}/posts?author=${req.params.id}`;
  const usersUrl = `${apiUrl}/users?include=${req.params.id}`;
  const categoriesUrl = `${apiUrl}/categories?per_page=100`;

  Promise.all([
    fetchJson(postsUrl),
    fetchJson(usersUrl),
    fetchJson(categoriesUrl),
    fetchJson(`${apiUrl}/author/${usersUrl}`),
  ])
  .then(([
    postsData,
    usersData,
    categoriesData
  ]) => {
      // Render colofon.ejs and pass the fetched data as 'posts' and 'users' variables
      //console.log("user", usersData)
      res.render('author.ejs', { posts: postsData, users: usersData[0], categories: categoriesData });
  })

  // Handle error if fetching data fails
  .catch((error) => {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  });

})


/////////////// categories route per id
app.get('/categories/:slug',function(req,res){
  // the data i need for this page
  // const categoriesUrl  = `${apiUrl}/categories=${req.params.id}`;
  // const category = categoriesData.find((category) => category.slug == request.params.slug);
  // const categoriesUrl  = `${apiUrl}/categories?include=${req.params.id}`;
  const categoriesUrl  = `${apiUrl}/categories?slug=${req.params.slug}`;

  fetchJson(categoriesUrl)
  .then((categoriesData) => {
    fetchJson(`${apiUrl}/posts?per_page=50&categories=${categoriesData[0].id}`)
    .then((postsData) => {
      // console.log("user", usersData, "posts", postsData)
      res.render(
        'categories.ejs', { 
          posts: postsData, 
        });
    })
  })

  

  // Handle error if fetching data fails
  .catch((error) => {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  });

})


// TODO:
// Category endpoint: app.get('/category/:categoryID'....)
// Fetch https://redpers.nl/wp-json/wp/v2/posts?categories={based on params.categoryID from URL}

// Maak een POST route 

app.post('/', function (request, response) {
  // Er is nog geen afhandeling van POST, redirect naar GET op /

  console.log(request.body)
  console.log("yes1")
 

  // fetch('https://fdnd.directus.app/items/person/' + request.params.id, {
  //     method: 'PATCH',
  //     body: JSON.stringify({
  //       custom: apiResponse.data.custom
  //     }),
  //     headers: {
  //       'Content-type': 'application/json; charset=UTF-8'
  //     }
  //   }).then((patchResponse) => {
  //     // Redirect naar de persoon pagina
  //     response.redirect(303, '/detail/' + request.params.id)
  //   })
  // })
  

  response.redirect(303, '/');
});


// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8005)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log('Server is running on port 8005')
  console.log(`Application started on http://localhost:${app.get('port')}`)
})

