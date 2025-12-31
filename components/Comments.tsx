"use client";

import { tableDB } from "@/models/client/config";
import { commentsCollection, db } from "@/models/name";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils"
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import { IconTrash } from "@tabler/icons-react";
import { ID, Models } from "appwrite";
import Link from "next/link";
import React from "react";
import { UserPrefs } from "@/store/auth";

type CommentWithAuthor = Models.Row & {
    authorId?: string,
    content?: string,
    author?: Models.User<UserPrefs>
}

const Comments = ({
    comments: _comments,
    type,
    typeId,
    className,
}: {
    comments: Models.RowList<CommentWithAuthor>;
    type: "question" | "answer";
    typeId: string;
    className?: string;
}) => {
    
    // Ensure comments has a valid structure with rows array
    const [comments, setComments] = React.useState<Models.RowList<CommentWithAuthor>>(() => {
        if (!_comments || !_comments.rows) {
            return { total: 0, rows: [] };
        }
        return _comments;
    });

    const [newComment, setNewComment] = React.useState("");
    const { user, hydrated } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!hydrated || !newComment || !user) return;

        try {
            const response = await tableDB.createRow({
                databaseId: db,
                tableId: commentsCollection,
                rowId: ID.unique(),
                data: {
                    content: newComment,
                    authorId: user.$id,
                    type: type,
                    typeId: typeId,
            }});
            console.log("Created comment: in Comment.tsx component", response);
            setComments(prev => ({
                total: (prev?.total || 0) + 1,
                rows: [{ ...response, authorId: user.$id, content: newComment, author: user }, ...(prev?.rows || [])],
            }));
        } catch (error: any) {
            window.alert(error?.message || "Error creating comment");
        }
    };

    const deleteComment = async (commentId: string) => {
        try {
            await tableDB.deleteRow({
                databaseId: db,
                tableId: commentsCollection,
                rowId: commentId
            });

            setComments(prev => ({
                total: Math.max(0, (prev?.total || 0) - 1),
                rows: (prev?.rows || []).filter(comment => comment.$id !== commentId),
            }));
        } catch (error: any) {
            window.alert(error?.message || "Error deleting comment");
        }
    };

    return (
        <div className={cn("flex flex-col gap-2 pl-4", className)}>
            {(comments?.rows || []).map(comment => (
                <React.Fragment key={comment.$id}>
                    <hr className="border-white/40" />
                    <div className="flex gap-2">
                        <p className="text-sm">
                            {comment.content} -{" "}
                            <Link
                                href={`/users/${comment.authorId}/${slugify(comment?.author?.name ?? comment.authorId ?? "user")}`}
                                className="text-orange-500 hover:text-orange-600"
                            >
                                {comment?.author?.name}
                            </Link>{" "}
                            <span className="opacity-60">
                                {convertDateToRelativeTime(new Date(comment.$createdAt))}
                            </span>
                        </p>
                        {hydrated && user?.$id === comment.authorId ? (
                            <button
                                onClick={() => deleteComment(comment.$id)}
                                className="shrink-0 text-red-500 hover:text-red-600"
                            >
                                <IconTrash className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </React.Fragment>
            ))}
            <hr className="border-white/40" />
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <textarea
                    className="w-full rounded-md border border-white/20 bg-white/10 p-2 outline-none"
                    rows={1}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={e => setNewComment(() => e.target.value)}
                />
                <button className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                    Add Comment
                </button>
            </form>
        </div>
    );
};

export default Comments;

// type CommentWithAuthor = {
//   // minimal document-like shape we actually use
//   $id: string;
//   $createdAt?: string;
//   authorId: string;
//   content: string;
//   author: Models.User<UserPrefs>; // author is an Appwrite user
// };

// const Comments = ({
//   comments: _comments,
//   type,
//   typeId,
//   className,
// }: {
//   // comments prop is an array where each element already contains author
//   comments: CommentWithAuthor[]; 
//   type: "question" | "answer";
//   typeId: string;
//   className?: string;
// }) => {
//   // local state is an array of CommentWithAuthor
//   const [comments, setComments] = React.useState<CommentWithAuthor[]>(
//     _comments ?? []
//   );

//   const [newComment, setNewComment] = React.useState("");
//   const { user } = useAuthStore();

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const trimmed = newComment.trim();
//     if (!trimmed || !user) return;

//     try {
//       const response = await tableDB.createRow({
//         databaseId: db,
//         tableId: commentsCollection,
//         rowId: ID.unique(),
//         data: {
//           content: trimmed,
//           authorId: user.$id,
//           type,
//           typeId,
//         },
//       });

//       // Minimal normalized comment object (cast to our minimal type)
//       const newDoc: CommentWithAuthor = {
//         $id: (response as Models.Row).$id ?? ID.unique(),
//         $createdAt: (response as Models.Row).$createdAt ?? new Date().toISOString(),
//         authorId: user.$id,
//         content: trimmed,
//         author: user,
//       };

//       // prepend to array
//       setComments(prev => [newDoc, ...prev]);

//       setNewComment("");
//     } catch (error: any) {
//       window.alert(error?.message || "Error creating comment");
//     }
//   };

//   const deleteComment = async (commentId: string) => {
//     try {
//       await tableDB.deleteRow({
//         databaseId: db,
//         tableId: commentsCollection,
//         rowId: commentId,
//       });

//       setComments(prev => prev.filter(c => c.$id !== commentId));
//     } catch (error: any) {
//       window.alert(error?.message || "Error deleting comment");
//     }
//   };

//   return (
//     <div className={cn("flex flex-col gap-2 pl-4", className)}>
//       {comments.map(comment => (
//         <React.Fragment key={comment.$id}>
//           <hr className="border-white/40" />
//           <div className="flex gap-2">
//             <p className="text-sm wrap-break-words">
//               {comment.content} -{" "}
//               <Link
//                 href={`/users/${encodeURIComponent(comment.authorId)}/${slugify(
//                   comment.author.name ?? comment.authorId
//                 )}`}
//                 className="text-orange-500 hover:text-orange-600"
//               >
//                 {comment.author.name ?? comment.authorId}
//               </Link>{" "}
//               <span className="opacity-60">
//                 {comment.$createdAt
//                   ? convertDateToRelativeTime(new Date(comment.$createdAt))
//                   : "some time ago"}
//               </span>
//             </p>

//             {user?.$id === comment.authorId ? (
//               <button
//                 type="button"
//                 onClick={() => deleteComment(comment.$id)}
//                 className="shrink-0 text-red-500 hover:text-red-600"
//               >
//                 <IconTrash className="h-4 w-4" />
//               </button>
//             ) : null}
//           </div>
//         </React.Fragment>
//       ))}

//       <hr className="border-white/40" />
//       <form onSubmit={handleSubmit} className="flex items-center gap-2">
//         <textarea
//           className="w-full rounded-md border border-white/20 bg-white/10 p-2 outline-none"
//           rows={1}
//           placeholder="Add a comment..."
//           value={newComment}
//           onChange={e => setNewComment(e.target.value)}
//         />
//         <button
//           type="submit"
//           className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
//         >
//           Add Comment
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Comments;