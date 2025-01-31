import Link from 'next/link';

export default function Login() {
    return (
        <div className="loginPage">
            <form name="loginForm">
                <label htmlFor="username">Username</label>
                <input type="text" placeholder="Username"></input>
                <label htmlFor="password">Password</label>
                <input type="text" placeholder="Password"></input>
                <button type="submit">Login</button>
            </form>
            <Link href="signup">Create Account</Link>
        </div>
    );
}
