const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    AuthenticationError,
    ForbiddenError,
} = require("apollo-server-express");
const mongoose = require("mongoose");
require("dotenv").config();

const gravatar = require("../util/gravatar.cjs");

module.exports = {
    signUp: async (parent, { name, email, password }, { models }) => {
        email = email.trim().toLowerCase();
        const hashed = await bcrypt.hash(password, 10);
        const avatar = gravatar(email);
        try {
            const user = await models.User.create({
                name,
                email,
                avatar,
                password: hashed,
            });
            return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error("Error creating account");
        }
    },
    signIn: async (parent, { email, password }, { models }) => {
        if (email) {
            email = email.trim().toLowerCase();
        }
        const user = await models.User.findOne({ email });

        if (!user) {
            throw new AuthenticationError("Error signing in");
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new AuthenticationError("Error signing in");
        }

        return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    },
    leaveFamily: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to leave family");
        }
        const family = await models.Family.findOne({ members: user.id });
        //Validate if owner, then cant leave.
        // TODO Remove from family !
        await models.User.findOneAndUpdate(
            { _id: user.id },
            { family: null },
            { new: true }
        );
        return "OK";
    },
    createFamily: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to create a family");
        }
        const result = await models.Family.create({
            family_name: args.family_name || null,
            owner: user.id,
            members: [user.id]
        });
        await models.User.findByIdAndUpdate(
            user.id,
            {
                family: mongoose.Types.ObjectId(result._id)
            },
            {
                new: true,
            }
        );
        return result;
    },
    deleteFamily: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete family");
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (family.owner !== user.id) {
            throw new AuthenticationError("You must be owner of family to delete it");
        }
        await models.Family.findOneAndDelete({ id: args.family_id });
        await models.User.updateMany({ family: args.family_id }, { family: null });
        return "Family deleted";
    },
    inviteMember: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to invite members");
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (family && String(family.owner) !== user.id) {
            throw new AuthenticationError(
                "You must be owner of family to invite members"
            );
        }
        await models.User.findByIdAndUpdate(
            args.user_id,
            {
                $push: {
                    invitations: mongoose.Types.ObjectId(args.family_id),
                },
            },
            {
                new: true,
            }
        );
        return true;
    },
    acceptFamily: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to invite members");
        }
        const currentUser = await models.User.findById(user.id);
        if (!currentUser) throw new Error("Error finding user");
        let invitations = [];
        for (let index = 0; index < currentUser.invitations.length; index++) {
            const element = currentUser.invitations[index];
            invitations.push(String(element));
        }

        if (!invitations.includes(args.family_id)) {
            throw new AuthenticationError(
                "You must be invited to the family"
            );
        }
        await models.User.findByIdAndUpdate(
            user.id,
            {
                $pull: {
                    invitations: mongoose.Types.ObjectId(args.family_id),
                },
                family: mongoose.Types.ObjectId(args.family_id)
            },
            {
                new: true,
            }
        );
        
        return await models.Family.findByIdAndUpdate(
            args.family_id,
            {
                $push: {
                    members: mongoose.Types.ObjectId(user.id),
                },
            },
            {
                new: true,
            }
        );
    },
    deleteFamilyMember: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete members");
        }
        const foundUser = await models.User.findById(user.id);
        const family = await models.Family.findById(foundUser.family);
        if (family && String(family.owner) !== user.id) {
            throw new AuthenticationError(
                "You must be owner of family to delete members"
            );
        }
        await models.Family.findByIdAndUpdate(
            foundUser.family,
            {
                $pull: {
                    members: mongoose.Types.ObjectId(args.user_id),
                },
            },
            {
                new: true,
            }
        );
        await models.User.findByIdAndUpdate(
            args.user_id,
            { family: null },
            { new: true }
        );
        return true;
    },
    updateFamily: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to update family");
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (!family || family.owner !== user) {
            throw new AuthenticationError(
                "You must be owner of family to update family"
            );
        }
        if (!args.family_name) {
            throw new ForbiddenError("You must provide some name for family");
        }
        return await models.Family.findByIdAndUpdate(
            args.family_id,
            { family_name: args.family_name },
            {
                new: true,
            }
        );
    },
    createItem: async (parent, args, { models, user }) => {
        return await models.Item.create({
            name: args.name,
            description: args.description,
            price: args.price,
        });
    },
    deleteItem: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete items");
        }
        await models.Item.findOneAndDelete({ _id: args.family_id });
        //TODO remove also from shopping lists
        return "Item deleted";
    },
    updateItem: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to update items");
        }
        const updateObject = {};
        if (args.description) updateObject.description = args.description;
        if (args.price) updateObject.price = args.price;
        if (args.name) updateObject.name = args.name;
        return await models.Item.findByIdAndUpdate(args.item_id, updateObject, {
            new: true,
        });
    },
    createListItem: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError(
                "You must be signed in to delete list items"
            );
        }
        const shoppingList = await models.ShoppingList.findOne({
            _id: args.shopping_list_id,
        });
        if (shoppingList.locked) {
            throw new ForbiddenError("Shopping list is locked");
        }
        // TODO calculate total.
        return await models.ListItem.create({
            item: mongoose.Types.ObjectId(args.item_id),
            shopping_list: mongoose.Types.ObjectId(args.shopping_list_id),
            notes: args.notes || null,
            quantity: args.quantity || 1,
        });
    },
    deleteListItem: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to delete list items");
        }
        const shoppingList = await models.ShoppingList.findById(args.shopping_list_id);
        if (shoppingList.locked) {
            throw new ForbiddenError("Shopping list is locked");
        }
        await models.ListItem.findOneAndDelete({ _id: args.list_item_id });
        return true;
    },
    updateListItem: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError("You must be signed in to update items");
        }
        const shoppingList = await models.ShoppingList.findById(args.shopping_list_id);
        if (shoppingList.locked) {
            throw new ForbiddenError("Shopping list is locked");
        }
        const updateObject = {};
        args.collected
            ? (updateObject.collected = true)
            : (updateObject.collected = false);
        if (args.quantity) updateObject.quantity = args.quantity;
        if (args.notes) updateObject.notes = args.notes;
        return await models.ListItem.findByIdAndUpdate(
            args.list_item_id,
            updateObject,
            {
                new: true,
            }
        );
    },
    createShoppingList: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError(
                "You must be signed in to create a shopping list"
            );
        }
        const foundUser = await models.User.findById(user.id);
        const result = await models.ShoppingList.create({
            name: args.name || null,
            owner_family: mongoose.Types.ObjectId(foundUser.family),
        });
        return result;
    },
    toggleShoppingList: async (parent, args, { models, user }) => {
        if (!user) {
            throw new AuthenticationError(
                "You must be signed in to toggle shopping list"
            );
        }
        const foundUser = await models.User.findById(user.id);
        const family = await models.Family.findById(foundUser.family);
        if (family && String(family.owner) !== user.id) {
            throw new AuthenticationError(
                "You must be owner of family to lock or unlock shopping lists"
            );
        }
        const shoppingList = await models.ShoppingList.findById(args.shopping_list_id);
        return await models.ShoppingList.findByIdAndUpdate(
            args.shopping_list_id,
            {
                $set: {
                    locked: !shoppingList.locked,
                },
            },
            {
                new: true,
            }
        );
    },
    deleteShoppingList: async (parent, args, { models }) => {
        if (!user) {
            throw new AuthenticationError(
                "You must be signed in to delete shopping lists"
            );
        }
        const family = await models.Family.findOne({ _id: args.family_id });
        if (family.owner !== user) {
            throw new AuthenticationError(
                "You must be owner of the family to toggle shopping lists"
            );
        }
        const shoppingList = await models.ShoppingList.findById({
            id: args.shopping_list_id,
        });
        if (shoppingList.owner_family !== family._id) {
            throw new AuthenticationError(
                "You must be owner family of this shopping lists"
            );
        }
        await models.ShoppingList.findOneAndDelete({ _id: args.shopping_list_id });
        return true;
    },
};
