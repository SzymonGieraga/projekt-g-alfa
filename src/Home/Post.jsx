import styles from './Home.module.css'
import CommentList from './CommentList';
import { useState, useEffect } from 'react';
import { format } from "date-fns";
import EventDetails from '../Content/EventDetails';
import Content from '../Content/Content';
import supabase from '../config/supabaseClient';


const Post = ({post, session}) => {
    const DEFAULT_TEXT_SIZE = 500;
    const [showComments, setShowComments] = useState(false);

    const [takePart, setTakePart] = useState(false);

    useEffect(()=>{
        if (!session) return;
        supabase.from('post_event_participations')
        .select()
        .eq('post_id', post.id)
        .then(({data})=>{
            if (data && data.length>0) setTakePart(true);
        })

    }, [session])


    const postTakePart = async (e) => {
            if (!session) return;
            setTakePart(e.target.checked)
            if(e.target.checked){
                await supabase
                .from('post_event_participations')
                .insert([
                    { user_id: session.user.id, post_id: post.id }
                ]).then(({error})=>{
                    if (error){
                        console.log(error);
                    }
                })
            }
            else{
                await supabase
                .from('post_event_participations')
                .delete()
                .eq('user_id', session.user.id)
                .eq('post_id', post.id)
                .then(({error}) => {
                    if (error) console.log(error);
                })
            }
    }
    const showCommentsButtonClickHandler = (e) => {
        setShowComments(!showComments);
        e.preventDefault();
    }



    return ( 
        <div className={styles.post}>
            {/* Head------------------------------------------------------------------- */}
            <div className={styles.postHead}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <div className={styles.postMetaData}>
                    <p className={styles.postAuthorName}><strong>{post.first_name} {post.last_name}</strong></p>
                    <p className={styles.postDate}><i>{format(new Date(post.created_at), "dd.MM.yyyy, HH:mm")}</i></p>
                </div>
            </div>

            {/* Body------------------------------------------------------------------- */}
            <div className={styles.postBody}>
                <Content text={post.text} defaultSizeToDisplay={DEFAULT_TEXT_SIZE}/>
            </div>

            {/* Event details---------------------------------------------------------- */}
            {post.is_event && <EventDetails event={post}/>}

            {/* Actions---------------------------------------------------------------- */}
            <div className={styles.actions}>
                <a href="#" onClick={(e) => showCommentsButtonClickHandler(e)} 
                    className={styles.commentButton}>
                    Komentarze...
                </a>

                {post.is_event && <label className={styles.postTakePart}>
                        <input type="checkbox" checked={takePart} onChange={(e)=>postTakePart(e)}/> 
                        Wezmę udział
                    </label>}

                 <select required className={styles.selectAction}>
                    <option value="all">Wiecej akcji</option>
                    <option value="Zglos post">Zglos post</option>
                    <option value="Ukryj post">Ukryj post</option>
                </select>
            </div>


            {/* Comments--------------------------------------------------------------- */}
            {showComments && (<CommentList post_id={post.id} session={session}/>)}
        </div>
     );
}
 
export default Post;