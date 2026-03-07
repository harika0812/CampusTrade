import User from "../models/User.js";

const buildUserPayload = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
	rollNo: user.rollNo || "",
	className: user.className || "",
	branch: user.branch || "",
	year: user.year || "",
	isVerified: !!user.isVerified,
	isSeller: !!user.isSeller,
	razorpayAccountId: user.razorpayAccountId || "",
});

export const getProfile = async (req, res) => {
	try {
		const userId = req.user?.userId;
		const user = await User.findById(userId).select(
			"name email rollNo className branch year isVerified isSeller razorpayAccountId"
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json({ user: buildUserPayload(user) });
	} catch (error) {
		console.error("GET PROFILE ERROR:", error);
		return res.status(500).json({ message: "Failed to fetch profile" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const userId = req.user?.userId;
		const { rollNo, className, branch, year } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.rollNo = (rollNo || "").trim();
		user.className = (className || "").trim();
		user.branch = (branch || "").trim();
		user.year = (year || "").trim();

		await user.save();

		return res.status(200).json({
			message: "Profile updated successfully",
			user: buildUserPayload(user),
		});
	} catch (error) {
		console.error("UPDATE PROFILE ERROR:", error);
		return res.status(500).json({ message: "Failed to update profile" });
	}
};
