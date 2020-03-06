import { Schema, Types } from 'mongoose';
import User, { UserDocument } from '../models/User';
import { Model } from 'models';
import logger from "../utils/logger";


export interface PermissionDocument extends Model.Permission.Data, Document { }

export const permissionSchema = new Schema<PermissionDocument>({
	granting: { type: Schema.Types.Map, of: [String] },
	granted: { type: Schema.Types.Map, of: [String] },
});

export function isPermissionType(permType: any): permType is Model.Permission.Type {
	return typeof permType === 'string' && (
		permType === 'read'
	);
}

permissionSchema.methods.resolveForDisplay = async function() {
	const allIds = [...new Set([...this.granted.keys(), ...this.granting.keys()])];
	const allUsers = indexNames(await User.find({
		_id: { $in: allIds.map(Types.ObjectId) }
	}));
	const permissions = {
		granted: remapPermissions(this.granted, allUsers),
		granting: remapPermissions(this.granting, allUsers)
	};
	return permissions;
}

function indexNames(users: UserDocument[]): {[k: string]: string} {
	return Object.assign({}, ...users.map((u) => ({ [u._id]: u.username })));
}

function remapPermissions(perms: Map<string, string[]>, users: {[k: string]: string}): Model.Permission.ResolvedRow {
	const ret: {[k: string]: string[]} = {};
	for (let id of perms.keys()) {
		ret[users[id]] = perms.get(id)!;
	}
	return ret;
}

