const URL = "http://localhost:3000/api/auth/register";

async function register(index) {
  const response = await fetch(URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email: "race@example.com",

      password: "bardzo-dlugie-haslo",
    }),
  });

  const body = await response.json();

  return {
    index,
    status: response.status,
    body,
  };
}

async function main() {
  const results = await Promise.all([register(1), register(2)]);

  for (const result of results) {
    console.log(`Request ${result.index}: ${result.status}`);

    console.log(JSON.stringify(result.body, null, 2));
  }
}

main().catch(console.error);
