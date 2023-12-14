
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { Comment } from './entities/Comment';

const app: Application = express();
const PORT: number = 3000;

app.use(bodyParser.json());

createConnection({
    type: 'mariadb',
    host: 'localhost',
    port: 3306,
    username: 'your_username',
    password: 'your_password',
    database: 'your_database',
    synchronize: true,
    logging: true,
    entities: [Post, Comment],
}).then(() => {
    console.log('Connected to the database');

    // API to get all posts
    app.get('/posts', async (req: Request, res: Response) => {
        const posts = await Post.find();
        res.json(posts);
    });

    // API to create a new post
    app.post('/posts', async (req: Request, res: Response) => {
        const { title, content, author } = req.body;
        const post = new Post({ title, content, author });
        await post.save();
        res.json(post);
    });

    // API to get comments for a specific post
    app.get('/posts/:postId/comments', async (req: Request, res: Response) => {
        const { postId } = req.params;
        const comments = await Comment.find({ where: { post: { post_id: postId } } });
        res.json(comments);
    });

    // API to add a comment to a post
    app.post('/posts/:postId/comments', async (req: Request, res: Response) => {
        const { postId } = req.params;
        const { content, author } = req.body;
        const post = await Post.findOne(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const comment = new Comment({ content, author, post });
        await comment.save();
        res.json(comment);
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((error) => console.log('Error connecting to the database:', error));