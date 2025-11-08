import { useSelector } from "react-redux"

const LatestPost =()=>{
const posts = useSelector(state => state.posts.items)

const lastPost = posts[posts.length -1]
if(!lastPost) return <p>No hay publicacines aun</p>
    return(
        <>
        <h3>Ultima publicacion</h3>
        <h4>{lastPost.title}</h4>
        <p>{lastPost.body}</p>
        </>
    )
}
export default LatestPost