import Link from 'next/link';

export default function Signup() {
    return (
        <div className="signupPage">
            <form name="signupForm">
                <label htmlFor="username">Username</label>
                <input type="text" placeholder="Username"></input>
                <label htmlFor="password">Password</label>
                <input type="text" placeholder="Password"></input>
                <button type="submit">Login</button>
            </form>
            <Link href="login">Log in</Link>
        </div>
    );
}
