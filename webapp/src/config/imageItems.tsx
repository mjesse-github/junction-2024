export type ImageItem = {
    imageName: string;
    correctAnswer: string;
    description: string;
    category: string;
    charity: {
      name: string;
      url: string;
      fact: string;
    };
  };

  export const imageItems: ImageItem[] = [
    {
      imageName: "landfill.png",
      correctAnswer: "Landfill",
      description: "A monstrous landfill in New Dehli",
      category: "Waste Management",
      charity: {
        name: "Clean Up The World, one day a year",
        url: "https://www.worldcleanupday.org",
        fact: "Recycling keeps landfills smaller."
      },
    },
    {
      imageName: "landfill-3.png",
      correctAnswer: "Landfill",
      description: "A landfill site in Estonia",
      category: "Waste Management",
      charity: {
        name: "Clean Up The World, one day a year",
        url: "https://www.worldcleanupday.org",
        fact: "The movement started in Estonia in 2008 when 50,000 people united to clean up their entire country in just five hours."
      },
    },
    {
      imageName: "circular-farm.jpg",
      correctAnswer: "Circular Farm",
      description: "Circular Farm in Kansas",
      category: "Farming",
      charity: {
        name: "Help fight world hunger",
        url: "https://convoyofhope.org/articles/world-hunger-charities/",
        fact: "Convoy of Hope has served more than 200 million people and distributed over $2 billion worth of food and supplies since 1994."
      },
    },
    {
      imageName: "coal-plant.png",
      correctAnswer: "Coal plant",
      description: "Coal plant in Pakistan",
      category: "Pollutant",
      charity: {
        name: "Clean Air Fund",
        url: "https://www.cleanairfund.org",
        fact: "Clean Air Fund created a unique 'Visualising Air Pollution' project, raising awareness through authentic visuals."
      },
    },
    {
      imageName: "rainbow.png",
      correctAnswer: "Rainbow",
      description: "Just a rainbow in UK",
      category: "Beauty",
      charity: {
        name: "Rainbow preservation fund",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        fact: "Did you know that climate change decreased occurances of rainbows by 70%? Check out the rainbow preservation fund"
      },
    },
    {
      imageName: "solar-farm-1.png",
      correctAnswer: "Solar Farm",
      description: "A solar farm, whichs picture looks like it could skyscrapers",
      category: "Renewable Energy",
      charity: {
        name: "Solar Aid",
        url: "https://solar-aid.org/",
        fact: "Solar Aid has helped over 11 million people access clean, safe solar light in Africa, saving families over $500 million in reduced energy costs."
      },
    },
    {
      imageName: "wind-mills.png",
      correctAnswer: "Wind mills",
      description: "A windmills in the forest a satellite image",
      category: "Renewable Energy",
      charity: {
        name: "WindEurope",
        url: "https://windeurope.org",
        fact: "Wind energy now meets 17% of Europe's electricity demand and is expected to be Europe's largest source of electricity by 2027."
      },
    },
];
