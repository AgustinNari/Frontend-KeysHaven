import ExampleComponent from "../components/ExampleComponent"
import PostForm from "../components/PostForm"
import PostList from "../components/PostList"

const Home = () => {
    return (
        <>
            <h2>Bienvenidos a la Home</h2>
            <ExampleComponent />
            <PostForm />
            <PostList/>

        </>
    )
}

export default Home