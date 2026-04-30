// lib/apollo-rsc-client.ts
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            cart: {
              merge(existing = {}, incoming = {}) {
                return { ...existing, ...incoming };
              },
            },
          },
        },
      },
    }),
    
    link: new HttpLink({
      uri: "https://gobikes.au/graphql",
    }),
  });
});