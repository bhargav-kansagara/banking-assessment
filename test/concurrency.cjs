

const createUser = async (id) => {
  const response = await fetch('http://localhost:8080/users/' + id, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "name": "abc",
      "balance": 100,
      "email": "abc@gmail.com"
    })
  });
  return await response.json();
}

const getUser = async (id) => {
  const response = await fetch('http://localhost:8080/users/' + id);
  return await response.json();
}

const transaction = async (userId, type, amount, idempotentKey) => {
  const response = await fetch('http://localhost:8080/transact', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "userId": userId,
      "type": type,
      "amount": amount,
      "idempotentKey": idempotentKey
    })
  });
  const body = await response.json();
  console.log(`Request '${idempotentKey}' completed at: ${new Date().toISOString()}`);
}

const randomString = () => {
  Math.random().toString(36).substr(2, 5)
}

const main = async () => {
  const userId = "test";
  var user = await createUser(userId);
  console.log(`User created with id: ${userId} and initial balance: ${user.balance}`);

  // Send 5 concurrent requests.
  var promises = [];
  for (let i = 0; i < 5; i++) {
    idempotentKey = userId + i;
    promises.push(transaction(userId, "credit", 10, idempotentKey))
    console.log(`Request '${idempotentKey}' initiated at: ${new Date().toISOString()}`);
  }

  // Get balance once all 5 requests are complete.
  Promise.all(promises).then(async (values) => {
    user = await getUser(userId);
    console.log(`Balance: ${user.balance}`);
  });
}

main();

