import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

/**
 * Transform a permission.granted or permission.granting to HTML
 * @param {{ [k: string]: string[] }}permissions permission.granted or permission.granting
 * @param {{ [k: string]: (permName: string, userName: string) => string }} V
 * being an object with 2 properties: hrefs and buttonsTexts. Each are taken in order.
 */
function transformPermissionToHTML(permissions, V) {
	const HTMLArr = [];
	for (const [username, perm] of Object.entries(permissions)) {
		let permLine = [<b key={username}>{username}</b>, ':'];
			for (const [i, permName] of perm.entries()) {
				permLine.push(permName);
				permLine.push(
					<a key={permName} href={V[i][1](permName, username)}>
						<button type='button'>{V[i][0]}</button>
					</a>
				);
			}
		HTMLArr.push(<li key={username}>{permLine}</li>);
	}
	return HTMLArr;
}

function ProfilPage(props) {
	const { errorMsg, successMsg, csrfToken, permissions } = props;
	
	const hasErrorMsg 	= Boolean(errorMsg.length > 0);
	const hasSuccessMsg = Boolean(successMsg.length > 0);
	
	const permissionsGranted = transformPermissionToHTML(permissions.granted, [
		['Watch', (_, userName) => `/display-user?showUser=${userName}`]
	]);
	const permissionsGranting = transformPermissionToHTML(permissions.granting, [
		['Revoke', (permName, userName) => `?rmUser=${userName}&rmPerm=${permName}`]
	]);

	return (
		<html>
			<Header title='SunShare' /> 
			<body>
				<h1>Profil</h1>

				{hasErrorMsg && <p className='errorMsg'>{errorMsg}</p>}
				{hasSuccessMsg && <p className='successMsg'>{successMsg}</p>}

				<h5>Change username</h5>
				<form action="/profil/update_username/" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="pwd">Password:&nbsp;</label>
					<input type="password" id="pwd" name="pwd" /><br/>
					<label htmlFor="new_username">New username:&nbsp;</label>
					<input type="text" name="new_username" id="new_username" />
					<input type="submit" value="submit" />
				</form>
    
				<h5>Change password</h5>
				<form action="/profil/update_password/" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="old_pwd">Old password:&nbsp;</label>
					<input type="password" id="old_pwd" name="old_pwd" /><br/>
					<label htmlFor="new_pwd">New password:&nbsp;</label>
					<input type="password" name="new_pwd" id="new_pwd" /><br/>
					<label htmlFor="new_pwd_confirm">Confirm new password:&nbsp;</label>
					<input type="password" name="new_pwd_confirm" id="new_pwd_confirm" />
					<input type="submit" value="submit" />
				</form>

				<h5>Permissions</h5>
				<form action="/profil/request_permissions/" method="POST">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<fieldset>
						<legend>Permissions that were granted to you:</legend>
						<ul>
							{permissionsGranted}
						</ul>
						{/* <fieldset>
							<legend>Request a permission grant: </legend>
							<label htmlFor="requested-permission">Request the permission to:</label>
							<select name="permission" id="requested-permission">
								<option value="read">Read User Data</option>
							</select>
							<label htmlFor="grantor">from the user:</label>
							<input type="text" name="grantor" id="grantor" />
							<br/>
							<input type="submit" value="Submit" />
						</fieldset> */}
					</fieldset>
				</form>
				<form action="/profil/update_permissions/" method="POST">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<fieldset>
						<legend>Permissions that you grant to other people:</legend>
						<ul>
							{permissionsGranting}
						</ul>
						<fieldset>
							<legend>Grant a permission to someone:</legend>
							<label htmlFor="grantedPermission">Grant the permission to:</label>
							<select name="permission" id="grantedPermission">
								<option value="read">Read My Data</option>
							</select>
							<label htmlFor="grantee">to the user:</label>
							<input type="text" name="grantee" id="grantee" />
							<br/>
							<input type="submit" value="Submit" />
						</fieldset>
					</fieldset>
				</form>
    
    			<a href="/"><button>Home</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default ProfilPage;
