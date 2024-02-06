const userTypes = require("../../../../enum/enum.userTypes");
const webhookInvoke = require("../../../../class/modules/webhooks/class.invokeWebhooks");

let guardFunctions = {
	init: async (req, res, next) => {
		try {
			if (
				!req.user.statusUser &&
                req.user.walletCreationStatus?.conditionsMet &&
                req.user.userType != userTypes["SIGNUP"].value
			) {
				let webhookInvokeInstance = new webhookInvoke(req.user);
				await webhookInvokeInstance.invokeAddWalletToCustomer();
			}
		} catch (ex) {
			console.log(ex);
		}
		next();
	},
};

module.exports = guardFunctions;
