import React from "react";
import { ForumHeader } from "../utils/ForumHeader";
import ForumStarter from "../utils/ForumStarter";
import { getPosts } from "../api/post.api";
import ThreadInput from "../components/ThreadInput";
import { PostCard } from "../components/PostCard";

const Forum = () => {
	const [show, setShow] = React.useState(true);
	const [posts, setPosts] = React.useState([]);
	const [loading, setLoading] = React.useState<boolean>(false);

	const fetchPosts = async () => {
		setLoading(true);
		console.log("fetching...");
        const fallback = setTimeout(() => {
            setLoading(false);
        }, 5000);
		try {
			const res = await getPosts();
            clearTimeout(fallback);
            if (res && res.data && res.data.posts) {
                setPosts(res.data.posts.reverse());
            } else {
                setPosts([]);
            }
			setShow(false);
		} catch (error) {
			console.log(error);
            setPosts([]);
		} finally {
            setLoading(false);
        }
	};

	React.useEffect(() => {
		fetchPosts();
	}, []);
	return (
		<div>
			<ForumHeader />
			{!posts && <ForumStarter setShow={setShow} />}
			{posts && <ThreadInput fetchPosts={fetchPosts} />}
			{posts && (
				<PostCard
					posts={posts}
					loading={loading}
					fetchPosts={fetchPosts}
				/>
			)}
		</div>
	);
};

export default Forum;
