
export type ImageItem = {
    imageName: string;
    correctAnswer: string;
    description: string;
    category: string;
    charity: {
      name: string;
      url: string;
    };
  };

  export const imageItems: ImageItem[] = [
    {
      imageName: "landfill.png",
      correctAnswer: "Landfill",
      description: "A landfill site in the Nevada Desert",
      category: "Waste Management",
      charity: {
        name: "Clean Up The World, one day a year",
        url: "https://www.worldcleanupday.org"
      },
    },
    {
      imageName: "circular-farm.jpg",
      correctAnswer: "Circular Farm",
      description: "Circular Farm in Kansas",
      category: "Farming",
      charity: {
        name: "Help fight world hunger",
        url: "https://convoyofhope.org/articles/world-hunger-charities/"
      },
    },
    {
      imageName: "solar-farm-1.png",
      correctAnswer: "Solar Farm",
      description: "A solar farm, whichs picture looks like it could skyscrapers",
      category: "Renewable Energy",
      charity: {
        name: "Solar Aid",
        url: "https://solar-aid.org/"
      },
    },
    // Add more items as needed
  ];
