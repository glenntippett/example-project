import { useQuery, useMutation, gql } from "@apollo/client";
import { useEffect, useState } from "react";

const LOGIN_MUTATION = gql`
  mutation GetToken($email: String!, $password: String!) {
    Auth {
      login(input: { email: $email, password: $password }) {
        token
        accounts {
          id
        }
      }
    }
  }
`;

const GET_AUTHORS = gql`
  query fetchAuthor($first: Int) {
    LearnV2 {
      SearchLearnOpportunities(first: $first) {
        edges {
          node {
            id
            shortDescription
            structureDefinition {
              title
              definitionType
            }
          }
        }
      }
    }
  }
`;

const LearnData = () => {
  const { loading, error, data } = useQuery(GET_AUTHORS, {
    variables: { first: 20 },
    context: {
      headers: {
        "X-Auth-Token": localStorage.getItem("token"),
        "X-Auth-Account-Id": localStorage.getItem("id"),
      },
    },
  });

  if (loading) return "Loading...";
  if (error) return "";

  return data.LearnV2.SearchLearnOpportunities.edges.map((edge) => {
    return (
      <div key={edge.node.id}>
        <strong>Description: </strong>
        <p> {edge.node.shortDescription}</p>

        <strong>Title: </strong>
        <p> {edge.node.structureDefinition.title}</p>
        <hr />
      </div>
    );
  });
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const [login, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem("token", data.Auth.login.token);
      localStorage.setItem("id", data.Auth.login.accounts[0].id);
    },
  });

  const headersSet = () => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("id");
    return token !== null && id !== null;
  };

  useEffect(() => {
    if (headersSet()) {
      setIsLoggedIn(true);
    }
  }, []);

  const getLoginToken = () => {
    login({
      variables: { email: formData.email, password: formData.password },
    });

    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setIsLoggedIn(false);
  };

  const handleChange = () => {
    setFormData({
      ...formData,
      email: "karl.kroeber@thekey.technology",
      password: "6AcZLrxPKrT9oK3o",
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    isLoggedIn ? logout() : getLoginToken();
  };

  if (loading) return "Logging In...";
  if (error) return `Submission error! ${error.message}`;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input onChange={handleChange} placeholder="email" name="email" />{" "}
        <input onChange={handleChange} placeholder="password" type="password" />{" "}
        <input type="submit" value={isLoggedIn ? "Logout" : "Login"} />
        <br />
        <br />
        <br />
      </form>

      {isLoggedIn && <LearnData />}
    </>
  );
}

export default App;
