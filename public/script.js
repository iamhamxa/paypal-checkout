paypal
  .Buttons({
    createOrder: function () {
      return fetch("/topup-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 6V7rbVwmlM1gFZKW_8QtzWXqpcwQ6T5vhEGYNJDAAdn3paCgRpdeMdVYmWzgbKSsECednupJ3Zx5Xd-g",
        },
        body: JSON.stringify({
          items: [
            {
              id: 2,
            },
          ],
        }),
      })
        .then((res) => {
          if (res.ok) return res.json();
          return res.json().then((json) => Promise.reject(json));
        })
        .then(({ id }) => {
          return id;
        })
        .catch((e) => {
          console.error(e.error);
        });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then((details) => {
        const name = details.payer.name.given_name;
        console.log(details);
        alert(`Transaction completed by ${name}`);
      });
    },
  })
  .render("#paypal");
