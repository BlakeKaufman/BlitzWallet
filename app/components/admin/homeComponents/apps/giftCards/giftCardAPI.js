const serverURL =
  process.env.BOLTZ_ENVIRONMENT === 'liquid'
    ? 'https://api.thebitcoincompany.com'
    : 'https://api.dev.thebitcoincompany.com';

export default async function callGiftCardsAPI({
  apiEndpoint,
  accessToken,
  email,
  password,
  resetToken,
  productId,
  cardValue,
  quantity,
  invoice,
  refreshToken,
}) {
  if (apiEndpoint === 'listGiftCards') {
    try {
      const response = await fetch(`${serverURL}/giftcards`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      return {
        statusCode: 200,
        body: {
          giftCards: data.result.svs,
        },
      };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 400,
        body: {
          error: 'Error getting options',
        },
      };
    }
  } else if (apiEndpoint === 'listGiftCardsWhenSignedIn') {
    try {
      const response = await fetch(`${serverURL}/svs/offers-for-user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.status.toString().startsWith('4')) {
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };
      }
      return {
        statusCode: 200,
        body: {
          giftCards: data.result.svs,
        },
      };
    } catch (err) {
      return {
        statusCode: 400,
        body: {
          error: 'Error getting options',
        },
      };
    }
  } else if (apiEndpoint === 'signUp') {
    try {
      const response = await fetch(`${serverURL}/auth/sign-up`, {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
          referralCode: 'TJNCEX',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      console.log(err, 'TESt');
      return {
        statusCode: 400,
        body: err,
      };
    }
  } else if (apiEndpoint === 'login') {
    try {
      console.log(email, password);
      const response = await fetch(`${serverURL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      console.log(data);
      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      console.log(err, 'TESt');
      return {
        statusCode: 400,
        body: err,
      };
    }
  } else if (apiEndpoint === 'getNewAccessToken') {
    try {
      const response = await fetch(`${serverURL}/auth/refresh-token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      const data = await response.json();

      console.log(data);
      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      console.log(err, 'TESt');
      return {
        statusCode: 400,
        body: err,
      };
    }
  } else if (apiEndpoint === 'lookupUser') {
    try {
      const response = await fetch(`${serverURL}/users/find`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      console.log(data);
      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      console.log(err, 'TESt');
      return {
        statusCode: 400,
        body: err,
      };
    }
  } else if (apiEndpoint === 'requestResetPassword') {
    try {
      const response = await fetch(`${serverURL}/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      const data = await response.json();
      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      console.log(err, 'TESt');
      return {
        statusCode: 400,
        body: err,
      };
    }
  } else if (apiEndpoint === 'resetAccountPassword') {
    try {
      const response = await fetch(`${serverURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password,
          resetToken: resetToken,
        }),
      });
      const data = await response.json();
      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      console.log(err, 'TESt');
      return {
        statusCode: 400,
        body: err,
      };
    }
  } else if (apiEndpoint == 'quoteGiftCard') {
    try {
      const response = await fetch(`${serverURL}/svs/quote-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: productId, //string
          cardValue: cardValue, //number
          quantity: quantity, //number
          purchaseType: 'Lightning',
        }),
      });
      const data = await response.json();

      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      return {
        statusCode: 400,
        body: {
          error: 'Error getting options',
        },
      };
    }
  } else if (apiEndpoint === 'buyGiftCard') {
    try {
      const response = await fetch(`${serverURL}/giftcards/purchase/bitcoin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: productId, //string
          cardValue: cardValue, //number
          quantity: quantity, //number
        }),
      });
      const data = await response.json();

      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      return {
        statusCode: 400,
        body: {
          error: 'Error getting options',
        },
      };
    }
  } else if (apiEndpoint === 'giftCardStatus') {
    try {
      const response = await fetch(`${serverURL}/svs/invoice-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          invoice: invoice,
        }),
      });
      const data = await response.json();

      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      return {
        statusCode: 400,
        body: {
          error: 'Error getting options',
        },
      };
    }
  } else if (apiEndpoint === 'getUserPurchases') {
    try {
      const response = await fetch(`${serverURL}/user/giftcards`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (data.statusCode === 400)
        return {
          statusCode: 400,
          body: {
            error: data.error,
          },
        };

      return {
        statusCode: 200,
        body: {
          response: data,
        },
      };
    } catch (err) {
      return {
        statusCode: 400,
        body: {
          error: 'Error getting options',
        },
      };
    }
  }
}
