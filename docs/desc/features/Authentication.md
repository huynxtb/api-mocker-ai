Implement authentication for this project following these instructions and rules:

1. Create the `login/logout` function using JWT within `60m` expire time
2. Have `refresh token` for this app
3. The password must be hash
4. All pages require `login first`
5. There is no init data. When there is no account the system will redirect to `Create System Account` page. And then allow user create new account with full permission.
If it already have account. The user can not use this page or api to create a system account for security risk.
6. Have the page allow user change the password - require `login first`