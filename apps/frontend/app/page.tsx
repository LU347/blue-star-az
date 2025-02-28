
export default function Home() {
  return (
    <div className="grid h-screen place-items-center p-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-2xl font-semibold italic">
          Supporting Our Service Members, One Package at a Time
        </h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Our Goal</h2>
          <p className="text-lg">
          Our mission is to support Blue Star Mothers of Maricopa by streamlining the management of service member addresses, simplifying the generation of shipping lists, tracking inventory efficiently, creating shipping labels, and handling custom forms with ease.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Blue Star Mothers of Maricopa AZ, AZ7</h2>
          <p className="text-lg">
          Blue Star Mothers of Maricopa is a dedicated charitable organization committed to supporting our brave service members. They send thoughtfully assembled care packages to deployed troops, providing them with comfort, encouragement, and a reminder that they are never forgotten.
          </p>
        </div>
      </div>
    </div>
  );
}

