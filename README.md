# TCLib crawler

This app is used to fetch books status with specified account of Taiwan Taichung Library, you can get books below:  
- Borrow
- Request
- Available
- Remaining slot to reserve books

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

**Configure App Info in the Environment Variable**
Based on your environment to setup Environment Variable, here are the example to configure in the PowerShell
* $env:TCLIB_ACCOUNT = "account1;account2";
* $env:TCLIB_PASSWORD = "password1;password2";
* $env:LINE_TOKEN = "Token number from LINE chat bot";
* $env:LINE_SECRET = "Channel Secret of LINE chat bot";
* $env:REDIS_URL = "Redis URL"

## Fetch book status locally(Without Chatbot)
1. Install Python and create a virtual environment.
```
python -m venv .venv
```
2. Activate the virtual environment and install the dependencies.
```
.venv/Scripts/activate
pip install -r requirements.txt
```
3. create a file named *credential.json* and add account setting.
```
    {
        "cred": [
            {
                "account": "id_1",
                "password": "pw_1"
            },
            {
                "account": "id_2",
                "password": "pw_2"
            }
        ]
    }
```
4. Run command below, and you'll get result from standard output.  
* -q: query status
```
python app/tclib.py -q
```

5. Run command below if you want to extend the period of book  
* -e: extend
* -u: user identity
* -p: password
* -b: book ID
```
python app/tclib.py -e -u <id> -p <pw> -b <bid>
