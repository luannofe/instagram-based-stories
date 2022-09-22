import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import BarStories from "./Components/BarStories";
import ButtonPost from "./Components/ButtonPost";
import Story from "./Components/Story";
import fb from "./FireBase";







function App() {

  const [loading, setLoading] = useState(false)
  postPeriodDelete()


  return (

    <>
    {loading && 
      <>
        <span className="title">L u a n n o f e g r a m</span>
        <a href="https://github.com/saskickers">
          <img style={{width: '24px', height: '24px', filter: 'invert(100%)', position: 'absolute', right: '5px', top: '5px'}} src="./githubIcon.png" ></img>
        </a>
        <ButtonPost />
        <BarStories>
          <Story />
        </BarStories>
      </>
      }
    </>
  );


  async function postPeriodDelete() {
    let posts = await getDocs(collection(fb.db, 'posts'))
    let now = new Date()
  
    return new Promise((resolve, reject) => {

      let i = 0
      
      posts.docs.forEach(async (post) => {

        if (post.data().created != 'un') {
          let time = new Date(post.data().created.toDate())
  
          if ((now - time) > 86400000) {
            await deleteStory(post)    
          } 
        }

        i ++
        if (i == posts.docs.length) {
          console.log('setando timeout')
          setTimeout(() => {
            resolve(setLoading(true))
          }, 2000)
        } 

      })
    })


  
    async function deleteStory(post) {
      let storRef = ref(fb.storage, post.data().ref)
      deleteObject(storRef).then(() => {
        deleteDoc(doc(fb.db, post.ref.path)).then(console.log('deletado tb'))
      })
    }
  }
}


export default App;
