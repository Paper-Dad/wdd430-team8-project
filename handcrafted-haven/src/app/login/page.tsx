import Header from "@/components/header";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="new-product-page">
        <header className="products-header">
          <h1>Sign in</h1>
          <p>Welcome back to Handcrafted Haven.</p>
        </header>
        <LoginForm />
      </main>
    </>
  );
}
