import { defineApp, defineSchema , defineTable } from "convex/server"
import { v } from "convex/values";

export default defineSchema({  
    users: defineTable({
        name: v.string(),
        email: v.string(),
        tokenIdentifier: v.string(),
        imageUrl: v.optional(v.string()), //Profile picture

        plan: v.union(v.literal("free"), v.literal("pro")),

        // usage tracking for plan limits
        projectsUsed: v.number(), //Current project count
        exportsThisMonth: v.number(), //Monthly export limit tracking

        createdAt: v.number(),
        lastActiveAt: v.number(),
    })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name",{searchField:"name"}) //User search
    .searchIndex("search_email",{searchField:"email"}),




    projects:defineTable({
        //Basic project info
        title: v.string(),
        userId: v.string("users"),

        //canvas dimesnsions and state
        canvasState: v.any(), //Fabric.js canvas JSON (objects,layers,etc.)
        width: v.number(), //Canvas widht in pixels
        height: v.number(), //canvas height in pixels

        //Image Pipeline - tracks image transformations
        originalImageUrl: v.optional(v.string()), //Initial uploaded image
        currentImageUrl: v.optional(v.string()), //Current processed image
        thumbnailUrl: v.optional(v.string()), //HW small preview for dashboard

        //Image-kit transformation state
        activeTransformations: v.optional(v.string()), //current Imagekit URL paramss

        //AI features state - tracks what AI processing has been applied
        backgroundRemoved: v.optional(v.boolean()), //Has background removed

        //Organization
        folderId: v.optional(v.id("folders")), //HW - optional folder organization

        //Timestamps
        createdAt: v.number(),
        updatedAt: v.number(), //Last edit time
    })
    .index("by_user",["userId"])
    .index("by_user_updated",["userId","updatedAt"])
    .index("by_folder",["folderId"]), //Projects in folder

    folders: defineTable({
        name: v.string(), //Folder name
        userId: v.id("users"), //owner
        createdAt: v.number(),
    }).index("by_user",["userId"]), //User's folder
}); 

/*
PLAN LIMITS EXAMPLE:
- Free: 3 Projects, 20 exports/month, basic features only
- Pro: Unlimited projects/exports, All AI features
*/
