import React from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';

/**
 * Transform a permission.granted or permission.granting to HTML
 * @param permissions ({{ [k: string]: string[] }}) permission.granted or permission.granting
 * @param V ({{ [k: string]: (permName: string, userName: string) => string }})
 * being an object with 2 properties: hrefs and buttonsTexts. Each are taken in order.
 */
function transformPermissionToHTML(permissions, V) {
	const HTMLArr = [];
	for (const [username, perm] of Object.entries(permissions)) {
		let permLine = [<b key={username}>{username}</b>, ':'];
		for (const [i, permName] of perm.entries()) {
			permLine.push(permName);
			for (const v of V) {
				let href = v[1](permName, username);
				if (href) {
					permLine.push(
						<a key={permName} href={href}>
							<button type='button'>{v[0]}</button>
						</a>
					);
				}
			}
		}
		HTMLArr.push(<li key={username}>{permLine}</li>);
	}
	return HTMLArr;
}

function ProfilPage(props) {
	const { errorMsg, successMsg, csrfToken, user, permissions } = props;
	
	const hasErrorMsg 	= Boolean(errorMsg.length > 0);
	const hasSuccessMsg = Boolean(successMsg.length > 0);
	const isUser		= ['admin', 'user'].includes(user.role);
	
	const permissionsGranted = transformPermissionToHTML(permissions.granted, [
		['Cancel', (permName, username) => `?rmGranter=${username}&rmPerm=${permName}`],
		['Watch', (permName, userName) => permName === 'read' && `/display-user?showUser=${userName}`],
	]);
	const permissionsGranting = transformPermissionToHTML(permissions.granting, [
		['Revoke', (permName, userName) => `?rmUser=${userName}&rmPerm=${permName}`]
	]);

	return (
		<html>
			<Header title='SunShare' /> 
			<body>
				<h1>Profil</h1>

				{hasErrorMsg && <p className='errorMsg' dangerouslySetInnerHTML={{ __html:errorMsg }}></p>}
				{hasSuccessMsg && <p className='successMsg' dangerouslySetInnerHTML={{ __html:successMsg }}></p>}

				<h5>Change username</h5>
				<form action="/profil/update_username/" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="pwd">Password:&nbsp;</label>
					<input type="password" id="pwd" name="pwd" required /><br/>
					<label htmlFor="new_username">New username:&nbsp;</label>
					<input type="text" name="new_username" id="new_username" required />
					<input type="submit" value="submit" />
				</form>
    
				<h5>Change password</h5>
				<form action="/profil/update_password/" method="post">
					<input type="hidden" name="_csrf" value={csrfToken} />
					<label htmlFor="old_pwd">Old password:&nbsp;</label>
					<input type="password" id="old_pwd" name="old_pwd" required /><br/>
					<label htmlFor="new_pwd">New password:&nbsp;</label>
					<input type="password" name="new_pwd" id="new_pwd" required /><br/>
					<label htmlFor="new_pwd_confirm">Confirm new password:&nbsp;</label>
					<input type="password" name="new_pwd_confirm" id="new_pwd_confirm" required />
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
								<option value="aggregate">Aggregate My Data</option>
							</select>
							<label htmlFor="grantee">to the user:</label>
							<input type="text" name="grantee" id="grantee" required />
							<br/>
							<input type="submit" value="Submit" />
						</fieldset>
					</fieldset>
				</form>
    
				{isUser && <a href="/profil/add-raspberry"><button>Add new Raspberry</button></a>}
				{isUser && <a href="/profil/delete-raspberry"><button>Delete Raspberry</button></a>}
    			<a href="/"><button>Home</button></a>
				<Footer />
			</body>
		</html>
	);
}

export default ProfilPage;
