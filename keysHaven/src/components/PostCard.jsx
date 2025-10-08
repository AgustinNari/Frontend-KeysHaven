const PostCard = ({ id, title, body }) => {
    return (
    <>   
        <h4>{id}</h4>
        <h4>{title}</h4>
        <h4>{body}</h4>
    </>
    );
};

export default PostCard;