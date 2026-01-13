// lib/apolloClient.js 

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";


const httpLink = createHttpLink({
  
  uri: "https://gobikes.au/graphql",
  
  fetch: async (uri, options) => {
    const token = localStorage.getItem('woo-session');
    if (token) {
      options.headers = {
        ...options.headers,
        'woocommerce-session': `Session ${token}`
      };
    }

    const response = await fetch(uri, options);
    
    const session = response.headers.get('woocommerce-session');
    if (session) {
      const newToken = session.split(';')[0].trim();
      if (newToken) {
        localStorage.setItem('woo-session', newToken);
      }
    }

    return response;
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    }
  },
});

export default client;