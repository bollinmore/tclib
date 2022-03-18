# TCLib crawler

This app is used to fetch books status with specified account of Taiwan Taichung Library, you can get:  
- Borrow
- Request
- Available

**Structure**
/app/
  tclib.py
/test/
/credential.json

**How it works**
It works with python requests and beautifulsoup module.

You can run it locally by typing:

```
python app/tclib.py
```

If you have the Flask installed, you can type this instead:

```
flask fetch-books
```

This same job can be run on-demand on a deployed Heroku app by typing:

```
heroku run flask fetch-books
```

**Account**
Based on your environment to setup Environment Variable, here are the example to configure in the PowerShell
* $env:TCLIB_ACCOUNT = "account1;account2";
* $env:TCLIB_PASSWORD = "password1;password2";
* $env:LINE_TOKEN = "Token number from LINE chat bot";
* $env:LINE_SECRET = "Channel Secret of LINE chat bot";
